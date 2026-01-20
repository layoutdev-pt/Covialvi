'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const hasCheckedAuth = useRef(false);
  const isRedirecting = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple checks
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const supabase = createClient();
    
    try {
      // Get session once
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('[AdminAuthWrapper] No session, redirecting to homepage');
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          setIsLoading(false);
          router.replace('/');
        }
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.log('[AdminAuthWrapper] No profile, redirecting to homepage');
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          setIsLoading(false);
          router.replace('/');
        }
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
        if (!isRedirecting.current) {
          isRedirecting.current = true;
          setIsLoading(false);
          router.replace('/');
        }
        return;
      }

      setProfile(profileData);
      setIsAuthorized(true);
      setIsLoading(false);
    } catch (error) {
      console.error('[AdminAuthWrapper] Error:', error);
      if (!isRedirecting.current) {
        isRedirecting.current = true;
        setIsLoading(false);
        router.replace('/');
      }
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
