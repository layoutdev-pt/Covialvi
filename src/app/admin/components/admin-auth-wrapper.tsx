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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const loadProfile = async () => {
      // Middleware already validated session exists
      // Just get session and load profile for UI
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Shouldn't happen - middleware redirects if no session
        router.replace('/auth/login?admin=true');
        return;
      }

      // Try to get profile from database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        // Check if user is admin
        const role = profileData.role || 'user';
        if (role !== 'admin' && role !== 'super_admin') {
          router.replace('/');
          return;
        }
        setProfile(profileData);
      } else {
        // Fallback profile from session
        setProfile({
          id: session.user.id,
          email: session.user.email,
          role: 'admin',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
        });
      }
      
      setIsReady(true);
    };

    loadProfile();

    // Handle sign out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/auth/login?admin=true');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Brief loading - only shows for first render
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
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
