import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createVisitCalendarEvent, hasGoogleCalendarConnected } from '@/lib/google-calendar';

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check if Google Calendar is connected
  const isConnected = await hasGoogleCalendarConnected(user.id);
  if (!isConnected) {
    return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
  }

  // Get upcoming visits that haven't been synced (use service client for full access)
  const serviceClient = createServiceClient();
  const { data: visits } = await serviceClient
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
      const eventId = await createVisitCalendarEvent(user.id, {
        id: visit.id,
        scheduled_at: visit.scheduled_at,
        property: visit.properties ? {
          title: visit.properties.title,
          reference: visit.properties.reference,
          address: `${visit.properties.address || ''}, ${visit.properties.municipality || ''}`,
        } : undefined,
        user: visit.profiles ? {
          first_name: visit.profiles.first_name,
          last_name: visit.profiles.last_name,
          email: visit.profiles.email,
          phone: visit.profiles.phone,
        } : undefined,
        notes: visit.notes,
      });

      if (eventId) {
        // Update visit with Google event ID
        await serviceClient
          .from('visits')
          .update({ google_event_id: eventId })
          .eq('id', visit.id);
        
        syncedCount++;
      }
    } catch (error) {
      console.error('Error syncing visit:', visit.id, error);
    }
  }

  return NextResponse.json({ message: 'Sync completed', synced: syncedCount });
}
