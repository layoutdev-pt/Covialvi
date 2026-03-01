import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile from the DB (bypasses RLS)
 */
export async function GET() {
  try {
    const userSupabase = createClient();
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const supabase = createServiceClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}
