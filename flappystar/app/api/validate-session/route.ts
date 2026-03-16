import { NextRequest, NextResponse } from 'next/server';
import { isSessionPaid } from '@/lib/stripe';
import { isSessionUsed } from '@/lib/supabase';
import { isSessionLocked } from '@/lib/redis';
import { validateSessionSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    // Validate input
    const validation = validateSessionSchema.safeParse({ session_id });
    if (!validation.success) {
      return NextResponse.json(
        { valid: false, reason: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    const sessionId = validation.data.session_id;

    // Check if session is paid in Stripe
    const isPaid = await isSessionPaid(sessionId);
    if (!isPaid) {
      return NextResponse.json(
        { valid: false, reason: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check Redis lock (quick check)
    const isLocked = await isSessionLocked(sessionId);
    if (isLocked) {
      return NextResponse.json(
        { valid: false, reason: 'Session already used' },
        { status: 400 }
      );
    }

    // Check database (authoritative check)
    const isUsed = await isSessionUsed(sessionId);
    if (isUsed) {
      return NextResponse.json(
        { valid: false, reason: 'Session already used' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Validate session error:', error);
    return NextResponse.json(
      { valid: false, reason: 'Server error' },
      { status: 500 }
    );
  }
}
