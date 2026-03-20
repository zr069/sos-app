import Stripe from 'stripe';

// Lazy-initialized Stripe client (only created when needed)
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Valid stake amounts in cents
export const VALID_STAKES = [50, 100, 500, 1000, 2500] as const;
export type StakeAmount = typeof VALID_STAKES[number];

export const CURRENCY = 'eur';

// Get multiplier for a stake amount
export function getMultiplier(stake: number): number {
  if (stake === 50) return 1;
  if (stake === 100) return 1;
  if (stake === 500) return 2;
  if (stake === 1000) return 3;
  if (stake === 2500) return 5;
  return 1;
}

// Validate stake amount
export function isValidStake(stake: number): stake is StakeAmount {
  return VALID_STAKES.includes(stake as StakeAmount);
}

// Create a checkout session for tournament entry
export async function createCheckoutSession(
  locale: string = 'en',
  stake: number = 50
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const multiplier = getMultiplier(stake);

  // Hardcoded base URL
  const siteUrl = 'https://flappystar.com';

  // Sanitize locale - only allow known locales
  const validLocales = ['en', 'de', 'fr', 'es', 'it', 'zh', 'ar', 'pl', 'hr', 'sr', 'ru'];
  const safeLocale = validLocales.includes(locale) ? locale : 'de';

  // Build URLs with locale prefix (required because pages are under [locale])
  const successUrl = `${siteUrl}/${safeLocale}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/${safeLocale}/payment/cancel`;

  console.log('STRIPE CHECKOUT:', { siteUrl, safeLocale, successUrl, cancelUrl, stake, multiplier });

  // Build product description based on multiplier
  const description = multiplier > 1
    ? `One entry with ${multiplier}x score multiplier`
    : 'One entry to compete for €10,000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    automatic_payment_methods: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: 'FlappyStar Tournament Entry',
            description,
          },
          unit_amount: stake,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'tournament_entry',
      stake: stake.toString(),
      multiplier: multiplier.toString(),
    },
    locale: mapLocaleToStripe(locale),
  });

  return session;
}

// Get checkout session by ID
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
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
    const stripe = getStripe();
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
  const stripe = getStripe();
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
