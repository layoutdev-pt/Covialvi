import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // Clear all Supabase auth cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/`);
  
  // Delete all auth-related cookies
  allCookies.forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.delete(cookie.name);
    }
  });
  
  return response;
}

export async function GET(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();
  
  // Clear all Supabase auth cookies
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/`);
  
  // Delete all auth-related cookies
  allCookies.forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.delete(cookie.name);
    }
  });
  
  return response;
}
