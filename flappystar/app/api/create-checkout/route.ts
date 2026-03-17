import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import {
  getCheckoutRatelimit,
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResult = await checkRateLimit(getCheckoutRatelimit, ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ),
        }
      );
    }

    // Get locale from request body or default to 'en'
    const body = await request.json().catch(() => ({}));
    const locale = body.locale || 'en';

    // Create Stripe checkout session
    const session = await createCheckoutSession(locale);

    return NextResponse.json(
      { url: session.url },
      {
        headers: getRateLimitHeaders(
          rateLimitResult.limit,
          rateLimitResult.remaining,
          rateLimitResult.reset
        ),
      }
    );
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
