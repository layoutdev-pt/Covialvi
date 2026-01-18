'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('[AdminAuthWrapper] No session, redirecting to homepage');
          router.replace('/');
          return;
        }

        // Check role from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role || 'user';
        const isAdmin = role === 'admin' || role === 'super_admin';

        console.log('[AdminAuthWrapper] Auth check:', { 
          email: session.user.email, 
          role, 
          isAdmin 
        });

        if (!isAdmin) {
          console.log('[AdminAuthWrapper] Not admin, redirecting to homepage');
          router.replace('/');
          return;
        }

        if (mounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[AdminAuthWrapper] Error:', error);
        if (mounted) {
          router.replace('/');
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
