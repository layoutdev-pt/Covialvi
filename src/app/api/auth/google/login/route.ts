import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify user is authenticated and is admin/consultant
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Generate state parameter with user ID for security
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Get Google OAuth URL
    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}
