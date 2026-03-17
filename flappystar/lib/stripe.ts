import Stripe from 'stripe';

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

// Tournament entry price in cents
export const TOURNAMENT_ENTRY_PRICE = 50; // €0.50
export const CURRENCY = 'eur';

// Create a checkout session for tournament entry
export async function createCheckoutSession(
  locale: string = 'en'
): Promise<Stripe.Checkout.Session> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: 'FlappyStar Tournament Entry',
            description: 'One entry to compete for €10,000',
          },
          unit_amount: TOURNAMENT_ENTRY_PRICE,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/${locale}/payment/cancel`,
    metadata: {
      type: 'tournament_entry',
    },
    locale: mapLocaleToStripe(locale),
  });

  return session;
}

// Get checkout session by ID
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId);
}

// Verify if session payment is complete
export async function isSessionPaid(sessionId: string): Promise<boolean> {
  try {
    const session = await getCheckoutSession(sessionId);
    return session.payment_status === 'paid';
  } catch {
    return false;
  }
}

// Verify and return Stripe session for anti-cheat validation
export async function verifyStripeSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // Verify it's a tournament entry
    if (session.metadata?.type !== 'tournament_entry') {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// Verify Stripe webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Map our locale codes to Stripe locale codes
function mapLocaleToStripe(locale: string): Stripe.Checkout.SessionCreateParams.Locale {
  const localeMap: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = {
    en: 'en',
    de: 'de',
    fr: 'fr',
    es: 'es',
    it: 'it',
    zh: 'zh',
    // Arabic uses auto fallback (not directly supported by Stripe)
    ar: 'auto',
    pl: 'pl',
    hr: 'hr',
    // Serbian uses Croatian fallback
    sr: 'hr',
    ru: 'ru',
  };

  return localeMap[locale] || 'auto';
}

// Export types
export type { Stripe };
