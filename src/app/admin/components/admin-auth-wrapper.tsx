'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkAuth() {
      try {
        console.log('[AdminAuthWrapper] Starting auth check...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[AdminAuthWrapper] Session result:', { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          email: session?.user?.email,
          error: sessionError?.message
        });
        
        if (!isMounted) return;
        
        if (sessionError || !session?.user) {
          console.log('[AdminAuthWrapper] No valid session, redirecting to homepage');
          setIsLoading(false);
          router.replace('/');
          return;
        }

        // Fetch full profile from database
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('[AdminAuthWrapper] Profile result:', { 
          hasProfile: !!profileData, 
          role: profileData?.role,
          error: profileError?.message
        });

        if (!isMounted) return;

        if (profileError || !profileData) {
          console.log('[AdminAuthWrapper] No profile, redirecting to homepage');
          setIsLoading(false);
          router.replace('/');
          return;
        }

        const role = profileData.role || 'user';
        const isAdmin = role === 'admin' || role === 'super_admin';

        console.log('[AdminAuthWrapper] Auth check complete:', { 
          email: session.user.email, 
          role, 
          isAdmin 
        });

        if (!isAdmin) {
          console.log('[AdminAuthWrapper] Not admin, redirecting to homepage');
          setIsLoading(false);
          router.replace('/');
          return;
        }

        if (isMounted) {
          setProfile(profileData);
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[AdminAuthWrapper] Error:', error);
        if (isMounted) {
          setIsLoading(false);
          router.replace('/');
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!isAuthorized || !profile) {
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
