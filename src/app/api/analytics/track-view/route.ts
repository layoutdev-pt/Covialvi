import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, slug } = body;

    if (!propertyId && !slug) {
      return NextResponse.json({ error: 'Property ID or slug required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Increment views_count
    if (propertyId) {
      await supabase.rpc('increment_property_views', { property_id: propertyId });
    } else if (slug) {
      // Get property ID from slug first
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (property) {
        await supabase.rpc('increment_property_views', { property_id: property.id });
      }
    }

    // Log the view for analytics
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const referer = request.headers.get('referer') || '';

    await supabase.from('property_views').insert({
      property_id: propertyId,
      ip_address: ip.split(',')[0].trim(),
      user_agent: userAgent.substring(0, 500),
      referer: referer.substring(0, 500),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
