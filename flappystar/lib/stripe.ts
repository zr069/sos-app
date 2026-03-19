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

// Stake tiers configuration
export const STAKE_TIERS = [
  { id: 'basic', price: 50, multiplier: 1, label: '€0.50' },
  { id: 'standard', price: 100, multiplier: 1, label: '€1.00' },
  { id: 'premium', price: 500, multiplier: 2, label: '€5.00' },
  { id: 'elite', price: 1000, multiplier: 3, label: '€10.00' },
  { id: 'champion', price: 2500, multiplier: 5, label: '€25.00' },
] as const;

export type StakeTierId = typeof STAKE_TIERS[number]['id'];

// Default stake (basic)
export const DEFAULT_STAKE_ID: StakeTierId = 'basic';
export const CURRENCY = 'eur';

// Get stake tier by ID
export function getStakeTier(stakeId: string) {
  return STAKE_TIERS.find(t => t.id === stakeId) || STAKE_TIERS[0];
}

// Create a checkout session for tournament entry
export async function createCheckoutSession(
  locale: string = 'en',
  stakeId: string = DEFAULT_STAKE_ID
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const stakeTier = getStakeTier(stakeId);

  // Hardcoded base URL
  const siteUrl = 'https://flappystar.com';

  // Sanitize locale - only allow known locales
  const validLocales = ['en', 'de', 'fr', 'es', 'it', 'zh', 'ar', 'pl', 'hr', 'sr', 'ru'];
  const safeLocale = validLocales.includes(locale) ? locale : 'de';

  // Build URLs with locale prefix (required because pages are under [locale])
  const successUrl = `${siteUrl}/${safeLocale}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/${safeLocale}/payment/cancel`;

  console.log('STRIPE CHECKOUT:', { siteUrl, safeLocale, successUrl, cancelUrl, stakeTier });

  // Build product description based on multiplier
  const description = stakeTier.multiplier > 1
    ? `One entry with ${stakeTier.multiplier}x score multiplier`
    : 'One entry to compete for €10,000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: 'FlappyStar Tournament Entry',
            description,
          },
          unit_amount: stakeTier.price,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'tournament_entry',
      stake_id: stakeTier.id,
      multiplier: stakeTier.multiplier.toString(),
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
