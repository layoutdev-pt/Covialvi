import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Mock client for when Supabase is not configured
const createMockQueryBuilder = (): any => {
  const builder: any = {
    data: [],
    error: null,
    count: 0,
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    not: () => builder,
    or: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => ({ data: null, error: null }),
    maybeSingle: () => ({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
  };
  return builder;
};

const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => createMockQueryBuilder(),
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
});

export function createClient(): any {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockClient();
  }
  
  // Return singleton instance to prevent multiple clients
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  
  return supabaseInstance;
}
