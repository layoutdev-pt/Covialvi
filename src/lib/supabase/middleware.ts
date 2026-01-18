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
  const isAccountRoute = request.nextUrl.pathname.startsWith('/conta');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  // Skip admin login page from admin route protection
  if (isAdminRoute && request.nextUrl.pathname === '/admin/login') {
    return response;
  }

  if (!user && (isAdminRoute || isAccountRoute)) {
    console.log('[Middleware] No user, redirecting to /auth/login');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check admin role for admin routes
  if (user && isAdminRoute) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: any };

    if (error) {
      console.error('[Middleware] Error fetching profile:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!profile) {
      console.error('[Middleware] No profile found for user:', user.id);
      return NextResponse.redirect(new URL('/', request.url));
    }

    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
    
    console.log('[Middleware] Admin check:', { 
      userId: user.id,
      email: user.email,
      role: profile.role,
      isAdmin,
      path: request.nextUrl.pathname
    });

    if (!isAdmin) {
      console.log('[Middleware] Access denied - not admin, redirecting to /');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}
