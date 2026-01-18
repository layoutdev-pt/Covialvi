import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check with server client (respects RLS)
    const serverSupabase = createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    
    // 2. Check with service role (bypasses RLS)
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get all favorites with service role
    const { data: allFavorites, error: allError } = await serviceSupabase
      .from('favorites')
      .select('*');
    
    // Get user's favorites with server client (RLS applied)
    let userFavorites = null;
    let userFavoritesError = null;
    if (user) {
      const result = await serverSupabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);
      userFavorites = result.data;
      userFavoritesError = result.error;
    }
    
    return NextResponse.json({
      authenticated: !!user,
      userId: user?.id || null,
      userEmail: user?.email || null,
      allFavoritesCount: allFavorites?.length || 0,
      allFavorites: allFavorites || [],
      allFavoritesError: allError,
      userFavoritesCount: userFavorites?.length || 0,
      userFavorites: userFavorites || [],
      userFavoritesError: userFavoritesError,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
