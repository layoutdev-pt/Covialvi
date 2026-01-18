import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip Supabase auth if credentials are not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

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
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // CRITICAL: Refresh the session to ensure we have the latest auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  // Protected routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAccountRoute = request.nextUrl.pathname.startsWith('/conta');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  // Allow /admin/login for everyone (it handles its own auth logic)
  if (isAdminLoginPage) {
    return response;
  }

  // Redirect unauthenticated users
  if (!user && isAdminRoute) {
    console.log('[Middleware] No user on admin route, redirecting to /admin/login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (!user && isAccountRoute) {
    console.log('[Middleware] No user on account route, redirecting to /auth/login');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check admin role for admin routes (excluding /admin/login)
  if (user && isAdminRoute) {
    // Get role from JWT app_metadata (faster than database lookup)
    const role = user.app_metadata?.role || user.user_metadata?.role || 'user';
    const isAdmin = role === 'admin' || role === 'super_admin';
    
    console.log('[Middleware] Admin check:', { 
      userId: user.id,
      email: user.email,
      role,
      isAdmin,
      path: request.nextUrl.pathname,
      source: 'JWT'
    });

    if (!isAdmin) {
      console.log('[Middleware] Access denied - not admin, redirecting to /');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}
