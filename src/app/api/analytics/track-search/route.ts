import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, nature, businessType, minPrice, maxPrice, bedrooms, resultsCount } = body;

    const supabase = createServiceClient();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    await supabase.from('search_logs').insert({
      location: location || null,
      nature: nature || null,
      business_type: businessType || null,
      min_price: minPrice || null,
      max_price: maxPrice || null,
      bedrooms: bedrooms || null,
      results_count: resultsCount || 0,
      ip_address: ip.split(',')[0].trim(),
      user_agent: userAgent.substring(0, 500),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track search error:', error);
    return NextResponse.json({ error: 'Failed to track search' }, { status: 500 });
  }
}
