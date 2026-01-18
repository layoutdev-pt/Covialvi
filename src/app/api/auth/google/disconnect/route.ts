import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { disconnectGoogleCalendar } from '@/lib/google-calendar';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await disconnectGoogleCalendar(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
