'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'unauthorized' | 'error';

const AUTH_TIMEOUT_MS = 8000; // 8 second timeout - deterministic

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [profile, setProfile] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Refs to prevent race conditions
  const hasCheckedRef = useRef(false);
  const isMountedRef = useRef(true);
  const supabaseRef = useRef(createClient());
  
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip for login page
    if (isLoginPage) {
      setAuthState('authenticated');
      return;
    }

    // Prevent multiple checks
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const supabase = supabaseRef.current;
    
    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && authState === 'loading') {
        console.error('[AdminAuth] Timeout reached');
        setAuthState('error');
        setErrorMessage('Tempo limite excedido. Tente novamente.');
      }
    }, AUTH_TIMEOUT_MS);

    const checkAuth = async () => {
      try {
        // Step 1: Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMountedRef.current) return;

        if (sessionError || !session?.user) {
          clearTimeout(timeoutId);
          setAuthState('unauthenticated');
          router.replace('/admin/login');
          return;
        }

        // Step 2: Get profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!isMountedRef.current) return;
        clearTimeout(timeoutId);

        // Determine role
        let role = 'user';
        let userProfile = null;

        if (profileData && !profileError) {
          role = profileData.role || 'user';
          userProfile = profileData;
        } else {
          // Fallback to session metadata
          role = session.user.app_metadata?.role || session.user.user_metadata?.role || 'user';
          userProfile = {
            id: session.user.id,
            email: session.user.email,
            role: role,
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
          };
        }

        // Step 3: Check admin role
        if (role !== 'admin' && role !== 'super_admin') {
          setAuthState('unauthorized');
          router.replace('/');
          return;
        }

        // Success - user is admin
        setProfile(userProfile);
        setAuthState('authenticated');
        
      } catch (err) {
        console.error('[AdminAuth] Error:', err);
        if (isMountedRef.current) {
          clearTimeout(timeoutId);
          setAuthState('error');
          setErrorMessage('Erro ao verificar autenticação');
        }
      }
    };

    checkAuth();

    // Listen for sign out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT' && isMountedRef.current) {
        setAuthState('unauthenticated');
        router.replace('/admin/login');
      }
    });

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [isLoginPage, router, authState]);

  // Skip auth UI for login page - render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Error state - deterministic, not infinite
  if (authState === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Erro de Autenticação</h2>
          <p className="text-muted-foreground">{errorMessage || 'Ocorreu um erro'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </button>
            <button
              onClick={() => router.replace('/admin/login')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">Não tem permissões para aceder ao painel de administração.</p>
          <button
            onClick={() => router.replace('/')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Voltar ao Site
          </button>
        </div>
      </div>
    );
  }

  // Loading state - with timeout guarantee (max 8 seconds)
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
          <p className="text-sm text-muted-foreground">A carregar painel...</p>
        </div>
      </div>
    );
  }

  // Authenticated but no profile yet (should not happen, but safety check)
  if (authState === 'authenticated' && !profile) {
    return null;
  }

  const isSuperAdmin = profile?.role === 'super_admin';

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
