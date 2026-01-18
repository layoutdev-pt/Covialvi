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
  const { data: { user } } = await supabase.auth.getUser();
  
  // If not logged in, redirect to admin login
  if (!user) {
    redirect('/admin/login');
  }
  
  // Get role from JWT (consistent with middleware)
  const role = user.app_metadata?.role || user.user_metadata?.role || 'user';
  const isAdmin = role === 'admin' || role === 'super_admin';
  
  // If logged in but not admin, redirect to admin login with error
  if (!isAdmin) {
    redirect('/admin/login?error=unauthorized');
  }

  // Fetch profile for display purposes (name, avatar, etc.)
  const profile = await getProfile();
  
  // If profile fetch failed, redirect to login
  if (!profile) {
    redirect('/admin/login');
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
