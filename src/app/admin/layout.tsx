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
  const profile = await getProfile();
  
  // If not logged in, redirect to admin login
  if (!profile) {
    redirect('/admin/login');
  }
  
  // If logged in but not admin, redirect to admin login with error
  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    redirect('/admin/login?error=unauthorized');
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
