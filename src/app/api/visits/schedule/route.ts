import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, scheduledAt, notes } = await request.json();
    
    if (!propertyId || !scheduledAt) {
      return NextResponse.json({ error: 'Property ID and scheduled time required' }, { status: 400 });
    }

    const { error } = await supabase.from('visits').insert({
      property_id: propertyId,
      user_id: user.id,
      scheduled_at: scheduledAt,
      notes: notes || null,
      status: 'pending',
    });

    if (error) {
      console.error('[API Visits] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Visits] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
