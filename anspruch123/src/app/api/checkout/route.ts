import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover",
  });
}

// Pricing configuration
const PRICING_TIERS = {
  BASIC: {
    name: "Basis",
    price: 4900, // in cents (49€)
    description: "Kostenlose Ersteinschätzung + Schriftverkehr",
    features: ["Kostenlose Ersteinschätzung", "Schriftverkehr mit Gegenseite", "E-Mail Support"],
  },
  STANDARD: {
    name: "Standard",
    price: 14900, // 149€
    description: "Vollständige rechtliche Vertretung",
    features: ["Alles aus Basis", "Außergerichtliche Vertretung", "Telefonische Beratung", "Dokumentenprüfung"],
  },
  PREMIUM: {
    name: "Premium",
    price: 29900, // 299€
    description: "Premium-Service mit Priorität",
    features: ["Alles aus Standard", "Gerichtliche Vertretung", "Prioritäts-Bearbeitung", "Persönlicher Ansprechpartner"],
  },
};

// Validation schema
const checkoutSchema = z.object({
  caseId: z.string().min(1, "Fall-ID erforderlich"),
  pricingTier: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// POST /api/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabedaten", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { caseId, pricingTier, successUrl, cancelUrl } = validationResult.data;
    const pricing = PRICING_TIERS[pricingTier];

    if (!pricing) {
      return NextResponse.json(
        { error: "Ungültiger Tarif" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string | undefined;

    const stripe = getStripe();

    // In production, you would store the Stripe customer ID with the user
    // For now, we'll search or create
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card", "sepa_debit", "giropay"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Anspruch123 - ${pricing.name}`,
              description: pricing.description,
              metadata: {
                caseId,
                pricingTier,
              },
            },
            unit_amount: pricing.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        caseId,
        pricingTier,
        userId: session.user.id,
      },
      success_url: successUrl || `${baseUrl}/dashboard/faelle/${caseId}?payment=success`,
      cancel_url: cancelUrl || `${baseUrl}/dashboard/faelle/${caseId}?payment=cancelled`,
      locale: "de",
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe-Fehler: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// GET /api/checkout - Get checkout session status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session-ID erforderlich" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer"],
    });

    return NextResponse.json({
      status: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
      customerEmail: checkoutSession.customer_details?.email,
      amountTotal: checkoutSession.amount_total,
      currency: checkoutSession.currency,
      metadata: checkoutSession.metadata,
    });

  } catch (error) {
    console.error("Error retrieving checkout session:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe-Fehler: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
