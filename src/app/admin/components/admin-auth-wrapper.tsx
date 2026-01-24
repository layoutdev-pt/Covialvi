'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>({
    id: '',
    email: 'admin@covialvi.com',
    role: 'admin',
    first_name: 'Admin',
    last_name: '',
  });
  
  const isLoginPage = pathname === '/admin/login';

  // Load profile once on mount (non-blocking)
  useEffect(() => {
    if (isLoginPage) return;
    
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setProfile({
            id: session.user.id,
            email: session.user.email || 'admin@covialvi.com',
            role: session.user.app_metadata?.role || session.user.user_metadata?.role || 'admin',
            first_name: session.user.user_metadata?.first_name || 'Admin',
            last_name: session.user.user_metadata?.last_name || '',
          });
        }
      } catch (err) {
        // Silent fail - use default profile
      }
    };
    
    loadProfile();
  }, [isLoginPage]);

  // Login page renders directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Admin panel renders directly - no loading states
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
