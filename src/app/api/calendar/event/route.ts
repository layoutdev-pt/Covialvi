import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { 
  updateCalendarEvent, 
  deleteCalendarEvent,
  hasGoogleCalendarConnected 
} from '@/lib/google-calendar';

/**
 * PATCH - Update a calendar event when visit is modified
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId, consultantId, scheduledAt, status } = body;

    if (!visitId || !consultantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if consultant has Google Calendar connected
    const isConnected = await hasGoogleCalendarConnected(consultantId);
    if (!isConnected) {
      return NextResponse.json({ success: true, message: 'No calendar connected' });
    }

    // Get visit with google_event_id
    const supabase = createServiceClient();
    const { data: visit } = await supabase
      .from('visits')
      .select('google_event_id')
      .eq('id', visitId)
      .single();

    if (!visit?.google_event_id) {
      return NextResponse.json({ success: true, message: 'No calendar event to update' });
    }

    // If cancelled, delete the event
    if (status === 'cancelled') {
      const deleted = await deleteCalendarEvent(consultantId, visit.google_event_id);
      
      if (deleted) {
        await supabase
          .from('visits')
          .update({ google_event_id: null })
          .eq('id', visitId);
      }

      return NextResponse.json({ success: deleted });
    }

    // Otherwise update the event
    if (scheduledAt) {
      const startTime = new Date(scheduledAt);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const updated = await updateCalendarEvent(consultantId, visit.google_event_id, {
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Lisbon',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Lisbon',
        },
      });

      return NextResponse.json({ success: updated });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

/**
 * DELETE - Delete a calendar event when visit is cancelled
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get('visitId');
    const consultantId = searchParams.get('consultantId');

    if (!visitId || !consultantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if consultant has Google Calendar connected
    const isConnected = await hasGoogleCalendarConnected(consultantId);
    if (!isConnected) {
      return NextResponse.json({ success: true, message: 'No calendar connected' });
    }

    // Get visit with google_event_id
    const supabase = createServiceClient();
    const { data: visit } = await supabase
      .from('visits')
      .select('google_event_id')
      .eq('id', visitId)
      .single();

    if (!visit?.google_event_id) {
      return NextResponse.json({ success: true, message: 'No calendar event to delete' });
    }

    const deleted = await deleteCalendarEvent(consultantId, visit.google_event_id);

    if (deleted) {
      await supabase
        .from('visits')
        .update({ google_event_id: null })
        .eq('id', visitId);
    }

    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
}
