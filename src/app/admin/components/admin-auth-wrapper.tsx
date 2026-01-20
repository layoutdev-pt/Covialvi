'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

// Timeout for auth check (prevents infinite loading)
const AUTH_TIMEOUT_MS = 10000;

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const initRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    
    // Prevent double initialization in React Strict Mode
    if (initRef.current) return;
    initRef.current = true;

    const supabase = createClient();
    let timeoutId: NodeJS.Timeout;

    // Set timeout fallback to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        console.error('[AdminAuthWrapper] Auth check timed out');
        setError('A verificação de autenticação demorou demasiado. Por favor, recarregue a página.');
        setIsLoading(false);
      }
    }, AUTH_TIMEOUT_MS);

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AdminAuthWrapper] Session error:', sessionError);
          throw new Error('Erro ao verificar sessão');
        }

        if (!session?.user) {
          // No session - middleware should have caught this, but handle gracefully
          console.log('[AdminAuthWrapper] No session found, redirecting to login');
          if (mountedRef.current) {
            router.replace('/auth/login?admin=true');
          }
          return;
        }

        // Fetch profile for display purposes
        // Middleware already validated admin role, so this is just for UI
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!mountedRef.current) return;

        if (profileError) {
          console.error('[AdminAuthWrapper] Profile error:', profileError);
          // Still allow access - middleware already validated
          setProfile({
            id: session.user.id,
            email: session.user.email,
            role: session.user.app_metadata?.role || session.user.user_metadata?.role || 'admin',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
          });
        } else {
          setProfile(profileData);
        }

        clearTimeout(timeoutId);
        setIsLoading(false);
      } catch (err) {
        console.error('[AdminAuthWrapper] Init error:', err);
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Erro de autenticação');
          setIsLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth state changes (logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('[AdminAuthWrapper] Auth state change:', event);
        
        if (event === 'SIGNED_OUT') {
          if (mountedRef.current) {
            router.replace('/auth/login?admin=true');
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed successfully - update profile if needed
          console.log('[AdminAuthWrapper] Token refreshed');
        }
      }
    );

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router, isLoading]);

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Erro de Autenticação</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
          <p className="text-muted-foreground text-sm">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  // No profile = something went wrong
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <p className="text-muted-foreground">Não foi possível carregar o perfil.</p>
          <button
            onClick={() => router.replace('/auth/login?admin=true')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const isSuperAdmin = profile.role === 'super_admin';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar profile={profile} isSuperAdmin={isSuperAdmin} />
      <div className="pl-72">
        <AdminTopbar profile={profile} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
