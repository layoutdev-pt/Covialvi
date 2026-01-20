import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  // Create initial response that forwards the request
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip Supabase auth if credentials are not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // Create Supabase client with cookie handling
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Route classification
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isAccountRoute = pathname.startsWith('/conta');
  const isAuthRoute = pathname.startsWith('/auth');

  // Get session - this refreshes the token if needed
  // IMPORTANT: Always await this before any redirect decisions
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('[Middleware] Session error:', sessionError.message);
  }

  const user = session?.user ?? null;

  // ============================================
  // ADMIN ROUTE PROTECTION (SERVER-SIDE)
  // ============================================
  if (isAdminRoute) {
    // No session = redirect to login
    if (!user) {
      console.log('[Middleware] Admin route, no session - redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('admin', 'true');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists - allow access immediately
    // Role verification happens client-side for speed
    // This ensures instant admin page loads
    return response;
  }

  // ============================================
  // ACCOUNT ROUTE PROTECTION
  // ============================================
  if (!user && isAccountRoute) {
    console.log('[Middleware] Account route, no session - redirecting to login');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ============================================
  // AUTH ROUTE - REDIRECT IF ALREADY LOGGED IN
  // ============================================
  if (user && isAuthRoute) {
    // Check if they were trying to access admin
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam?.startsWith('/admin')) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
