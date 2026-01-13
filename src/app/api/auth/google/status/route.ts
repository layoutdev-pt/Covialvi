import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ connected: false });
  }

  const { data: tokens } = await supabase
    .from('google_calendar_tokens')
    .select('google_email, google_name, google_picture, expires_at')
    .eq('user_id', user.id)
    .single();

  if (!tokens) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    email: tokens.google_email,
    name: tokens.google_name,
    picture: tokens.google_picture,
  });
}
