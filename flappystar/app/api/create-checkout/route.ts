import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, isValidStake } from '@/lib/stripe';
import {
  getCheckoutRatelimit,
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
} from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  // Debug environment variables
  console.log('ENV CHECK:', {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

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

    // Get locale and stake from request body
    const body = await request.json().catch(() => ({}));
    const locale = body.locale || 'en';
    const stake = body.stake || 50;

    // Validate stake amount
    if (!isValidStake(stake)) {
      return NextResponse.json(
        { error: 'Invalid stake amount' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(locale, stake);

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
    // Log full error details for debugging
    console.error('Create checkout error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });

    // Return descriptive error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to create checkout session';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
