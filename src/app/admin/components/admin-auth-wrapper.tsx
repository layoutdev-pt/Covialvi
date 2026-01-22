'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  
  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login';

  const loadProfile = useCallback(async () => {
    const supabase = supabaseRef.current;
    
    try {
      // Get session - middleware already validated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace('/admin/login');
        return;
      }

      // Try to get profile from database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        const role = profileData.role || 'user';
        if (role !== 'admin' && role !== 'super_admin') {
          router.replace('/');
          return;
        }
        setProfile(profileData);
      } else {
        // Fallback profile from session metadata
        const role = session.user.app_metadata?.role || session.user.user_metadata?.role || 'user';
        if (role !== 'admin' && role !== 'super_admin') {
          router.replace('/');
          return;
        }
        setProfile({
          id: session.user.id,
          email: session.user.email,
          role: role,
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
        });
      }
      
      setIsReady(true);
    } catch (err) {
      console.error('[AdminAuthWrapper] Error:', err);
      setError('Erro ao carregar perfil');
    }
  }, [router]);

  useEffect(() => {
    // Skip for login page
    if (isLoginPage) return;
    
    // Only load once
    if (isReady) return;

    loadProfile();

    // Handle sign out
    const supabase = supabaseRef.current;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/admin/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoginPage, isReady, loadProfile, router]);

  // Skip auth UI for login page - render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Error fallback UI
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Erro de Autenticação</h2>
          <p className="text-muted-foreground">{error}</p>
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

  // Loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
          <p className="text-sm text-muted-foreground">A carregar painel...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
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
