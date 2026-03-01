import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getProfileRole(userId: string): Promise<string> {
  if (!supabaseUrl || !supabaseServiceKey) return 'user';
  try {
    const serviceClient = createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    return (data as any)?.role || 'user';
  } catch {
    return 'user';
  }
}

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
  
  // ALWAYS allow public routes - no auth required
  const publicRoutes = ['/', '/sobre', '/servicos', '/imoveis', '/contacto', '/avaliacao-completa', '/recrutamento'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  if (isPublicRoute) {
    return response; // Allow public routes immediately
  }
  
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
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
  // ADMIN ROUTES - Server-side protection
  // ============================================
  if (isAdminRoute) {
    // Always allow the login page
    if (isAdminLoginRoute) {
      if (user) {
        // Check DB profile role (not stale JWT)
        const dbRole = await getProfileRole(user.id);
        if (dbRole === 'admin' || dbRole === 'super_admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return response;
    }

    // All other /admin/* require a valid session
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists — check DB profile role (not stale JWT)
    const dbRole = await getProfileRole(user.id);
    const isAdminUser = dbRole === 'admin' || dbRole === 'super_admin';

    if (!isAdminUser) {
      // Authenticated but not admin — send to homepage
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin confirmed — allow through
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
  // (but always allow /auth/logout and /auth/callback)
  // ============================================
  const isLogoutRoute = pathname === '/auth/logout';
  const isCallbackRoute = pathname === '/auth/callback';
  if (user && isAuthRoute && !isLogoutRoute && !isCallbackRoute) {
    // Check if they were trying to access admin
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam?.startsWith('/admin')) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
