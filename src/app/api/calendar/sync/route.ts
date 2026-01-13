import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  return data.access_token || null;
}

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get Google Calendar tokens
  const { data: tokens } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!tokens) {
    return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
  }

  // Check if token needs refresh
  let accessToken = tokens.access_token;
  if (new Date(tokens.expires_at) < new Date()) {
    accessToken = await refreshAccessToken(tokens.refresh_token);
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 });
    }
    
    // Update token in database
    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      })
      .eq('user_id', user.id);
  }

  // Get upcoming visits that haven't been synced
  const { data: visits } = await supabase
    .from('visits')
    .select(`
      *,
      properties:property_id (title, reference, municipality, address),
      profiles:user_id (first_name, last_name, email, phone)
    `)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())
    .is('google_event_id', null);

  if (!visits || visits.length === 0) {
    return NextResponse.json({ message: 'No visits to sync', synced: 0 });
  }

  let syncedCount = 0;

  for (const visit of visits) {
    try {
      const startTime = new Date(visit.scheduled_at);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      const event = {
        summary: `Visita: ${visit.properties?.reference || 'Imóvel'}`,
        description: `Cliente: ${visit.profiles?.first_name || ''} ${visit.profiles?.last_name || ''}\nEmail: ${visit.profiles?.email || ''}\nTelefone: ${visit.profiles?.phone || ''}\n\nImóvel: ${visit.properties?.title || ''}\nMorada: ${visit.properties?.address || ''}, ${visit.properties?.municipality || ''}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Lisbon',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Lisbon',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'email', minutes: 60 },
          ],
        },
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (response.ok) {
        const createdEvent = await response.json();
        
        // Update visit with Google event ID
        await supabase
          .from('visits')
          .update({ google_event_id: createdEvent.id })
          .eq('id', visit.id);
        
        syncedCount++;
      }
    } catch (error) {
      console.error('Error syncing visit:', visit.id, error);
    }
  }

  return NextResponse.json({ message: 'Sync completed', synced: syncedCount });
}
