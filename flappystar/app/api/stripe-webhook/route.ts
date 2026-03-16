import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Log successful payment
        console.log('Payment completed:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          metadata: session.metadata,
        });

        // The actual score submission happens when the user submits their score
        // This webhook just confirms the payment was successful
        // We could pre-register the session here if needed

        break;
      }

      case 'payment_intent.succeeded': {
        // Additional confirmation of payment
        console.log('Payment intent succeeded:', event.data.object.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        // Log failed payment for monitoring
        console.log('Payment failed:', event.data.object.id);
        break;
      }

      default:
        // Log unhandled event types for debugging
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

