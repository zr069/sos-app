import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { CaseStatus, InvoiceStatus, PricingTier } from "@prisma/client";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
      return NextResponse.json(
        { error: "Keine Signatur vorhanden" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook nicht konfiguriert" },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Ungültige Webhook-Signatur" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook-Verarbeitung fehlgeschlagen" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  const { caseId, pricingTier, userId } = session.metadata || {};

  if (!caseId) {
    console.error("No caseId in session metadata");
    return;
  }

  // Map pricing tier string to enum
  const tierMap: Record<string, PricingTier> = {
    "BASIC": PricingTier.BASIS,
    "STANDARD": PricingTier.DURCHSETZEN,
    "PREMIUM": PricingTier.KOMPLETT,
  };

  const tier = tierMap[pricingTier || "STANDARD"] || PricingTier.DURCHSETZEN;

  // Update case status
  await prisma.case.update({
    where: { id: caseId },
    data: {
      status: CaseStatus.IN_PRUEFUNG,
    },
  });

  // Get case to find user
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: { userId: true },
  });

  // Create invoice record
  if (caseData?.userId) {
    await prisma.invoice.create({
      data: {
        caseId,
        userId: caseData.userId,
        stripePaymentId: session.payment_intent as string || null,
        amount: session.amount_total || 0,
        pricingTier: tier,
        status: InvoiceStatus.BEZAHLT,
        paidAt: new Date(),
        description: `Anspruch123 - ${pricingTier}`,
      },
    });
  }

  // TODO: Send confirmation email
  // await sendPaymentConfirmationEmail(session.customer_details?.email, caseId);

  console.log(`Payment completed for case ${caseId}, tier: ${pricingTier}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);

  // Update payment records
  const invoice = await prisma.invoice.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (invoice) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.BEZAHLT,
        paidAt: new Date(),
      },
    });
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  const lastError = paymentIntent.last_payment_error;
  console.error("Payment error:", lastError?.message);

  // Update invoice status
  const invoice = await prisma.invoice.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (invoice) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.STORNIERT,
      },
    });

    // Get case and user info for notification
    const caseData = await prisma.case.findUnique({
      where: { id: invoice.caseId },
      include: { user: true, contactInfo: true },
    });

    if (caseData) {
      const email = caseData.user?.email || caseData.contactInfo?.email;
      console.log(`Payment failed for case ${caseData.caseNumber}, notify: ${email}`);
      // TODO: Send payment failed email
      // await sendPaymentFailedEmail(email, caseData.caseNumber);
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("Invoice paid:", invoice.id);

  // Handle subscription invoices if applicable
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Invoice payment failed:", invoice.id);

  // Handle failed subscription payments
}
