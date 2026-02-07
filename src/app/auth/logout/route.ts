import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function handleLogout(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/`, { status: 302 });

  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseAnonKey) {
    // Create a Supabase client that writes cookies directly to the response
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    });

    // This will trigger cookie removal via the handlers above
    await supabase.auth.signOut();
  }

  // Also force-clear any remaining auth cookies
  const allCookies = cookieStore.getAll();
  allCookies.forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.set({
        name: cookie.name,
        value: '',
        path: '/',
        maxAge: 0,
      });
    }
  });

  return response;
}

export async function GET(request: Request) {
  return handleLogout(request);
}

export async function POST(request: Request) {
  return handleLogout(request);
}
