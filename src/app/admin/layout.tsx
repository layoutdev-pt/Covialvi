import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from './components/admin-sidebar';
import { AdminTopbar } from './components/admin-topbar';

async function getProfile(): Promise<any | null> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('[Admin Layout] Error getting user:', userError);
    return null;
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (profileError) {
    console.error('[Admin Layout] Error getting profile:', profileError);
    return null;
  }
    
  return profile;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  // Try to get user - if this fails, user is not logged in
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log('[Admin Layout] User check:', { 
    hasUser: !!user, 
    email: user?.email,
    error: userError?.message 
  });
  
  // If not logged in, redirect to admin login
  if (!user) {
    console.log('[Admin Layout] No user, redirecting to /admin/login');
    redirect('/admin/login');
  }
  
  // Fetch profile from database (more reliable than JWT)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  console.log('[Admin Layout] Profile check:', { 
    hasProfile: !!profile, 
    role: profile?.role,
    error: profileError?.message 
  });
  
  // If profile fetch failed, redirect to login
  if (!profile) {
    console.log('[Admin Layout] No profile, redirecting to /admin/login');
    redirect('/admin/login');
  }
  
  // Check role from profile (database is source of truth)
  const role = profile.role || 'user';
  const isAdmin = role === 'admin' || role === 'super_admin';
  
  // If logged in but not admin, redirect to admin login with error
  if (!isAdmin) {
    console.log('[Admin Layout] Not admin, redirecting to /admin/login');
    redirect('/admin/login?error=unauthorized');
  }
  
  const isSuperAdmin = role === 'super_admin';

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
