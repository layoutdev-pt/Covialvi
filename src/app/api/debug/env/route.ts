import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  return NextResponse.json({
    supabase_url_configured: !!supabaseUrl,
    supabase_url_preview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    anon_key_configured: !!supabaseAnonKey,
    anon_key_preview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET',
    service_role_configured: !!serviceRoleKey,
    service_role_preview: serviceRoleKey ? serviceRoleKey.substring(0, 20) + '...' : 'NOT SET',
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    app_name: process.env.NEXT_PUBLIC_APP_NAME || 'NOT SET',
  });
}
