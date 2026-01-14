import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangeCodeForTokens, storeTokens } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(new URL('/admin/definicoes?error=google_auth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/definicoes?error=no_code', request.url));
  }

  try {
    // Verify state parameter
    let stateData: { userId: string; timestamp: number } | null = null;
    if (state) {
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      } catch {
        console.error('Invalid state parameter');
      }
    }

    // Verify user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/admin/definicoes?error=not_authenticated', request.url));
    }

    // Verify state matches current user (security check)
    if (stateData && stateData.userId !== user.id) {
      return NextResponse.redirect(new URL('/admin/definicoes?error=state_mismatch', request.url));
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Store tokens in database
    await storeTokens(user.id, tokens);

    return NextResponse.redirect(new URL('/admin/definicoes?success=google_connected', request.url));
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/admin/definicoes?error=unknown', request.url));
  }
}
