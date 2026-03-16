import { NextRequest, NextResponse } from 'next/server';
import {
  getTournamentStats,
  getTournamentSettings,
  updateTournamentSettings,
  getAllEntries,
} from '@/lib/supabase';
import {
  getCachedTournamentSettings,
  setCachedTournamentSettings,
  flushAllCache,
} from '@/lib/redis';
import { tournamentSettingsSchema } from '@/lib/validations';

// Verify admin authentication
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  return username === 'admin' && password === process.env.ADMIN_PASSWORD;
}

// GET - Fetch admin data (stats, settings, entries)
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'stats': {
        const stats = await getTournamentStats();
        return NextResponse.json(stats);
      }

      case 'settings': {
        // Try cache first
        type TournamentSettings = {
          id: number;
          start_date: string | null;
          end_date: string | null;
          prize_amount: number;
          is_active: boolean;
          max_entries: number | null;
        };
        const cached = await getCachedTournamentSettings<TournamentSettings>();
        if (cached) {
          return NextResponse.json(cached);
        }

        const settings = await getTournamentSettings();
        if (settings) {
          await setCachedTournamentSettings(settings);
        }
        return NextResponse.json(settings);
      }

      case 'entries': {
        const page = parseInt(searchParams.get('page') || '1', 10);
        const entries = await getAllEntries(page, 50);
        return NextResponse.json(entries);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// POST - Update settings or perform actions
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
      }
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_settings': {
        const validation = tournamentSettingsSchema.safeParse(body.settings);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid settings', details: validation.error.flatten() },
            { status: 400 }
          );
        }

        const updated = await updateTournamentSettings(validation.data);

        // Invalidate settings cache
        await setCachedTournamentSettings(updated);

        return NextResponse.json({ success: true, settings: updated });
      }

      case 'flush_cache': {
        await flushAllCache();
        return NextResponse.json({ success: true, message: 'Cache flushed' });
      }

      case 'declare_winner': {
        // This would typically send an email, update a status, etc.
        // For now, just acknowledge the action
        console.log('Winner declared at:', new Date().toISOString());
        return NextResponse.json({
          success: true,
          message: 'Winner declaration logged',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
