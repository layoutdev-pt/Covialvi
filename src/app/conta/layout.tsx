import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Heart, Calendar, User, Shield, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProfile(): Promise<any | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  
  // Allow access without auth for demo purposes when Supabase is not configured
  const navigation = [
    { name: 'Perfil', href: '/conta', icon: User },
    { name: 'Favoritos', href: '/conta/favoritos', icon: Heart },
    { name: 'Visitas', href: '/conta/visitas', icon: Calendar },
    { name: 'Privacidade', href: '/conta/privacidade', icon: Shield },
    { name: 'Definições', href: '/conta/definicoes', icon: Settings },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
        <div className="container-wide section-padding">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                {/* User Info */}
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {profile?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h2 className="font-semibold text-lg text-foreground">
                    {profile?.first_name || 'Utilizador'} {profile?.last_name || ''}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || 'utilizador@exemplo.com'}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-lg hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
