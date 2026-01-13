'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  FileText,
  Shield,
  TrendingUp,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
  profile: {
    first_name?: string;
    last_name?: string;
    role: string;
  };
  isSuperAdmin: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Imóveis', href: '/admin/imoveis', icon: Building2 },
  { name: 'CRM', href: '/admin/crm', icon: MessageSquare },
  { name: 'Visitas', href: '/admin/visitas', icon: Calendar },
  { name: 'Utilizadores', href: '/admin/utilizadores', icon: Users },
  { name: 'Relatórios', href: '/admin/relatorios', icon: TrendingUp },
  { name: 'Auditoria', href: '/admin/auditoria', icon: FileText },
  { name: 'Definições', href: '/admin/definicoes', icon: Settings },
];

const superAdminNav = { name: 'Administradores', href: '/admin/administradores', icon: Shield };

export function AdminSidebar({ profile, isSuperAdmin }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = isSuperAdmin 
    ? [...navigation.slice(0, 7), superAdminNav, navigation[7]]
    : navigation;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center">
            <Image
              src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
              alt="Covialvi"
              width={140}
              height={45}
              className="h-10 w-auto dark:brightness-0 dark:invert"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                <div className="flex items-center">
                  <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Help */}
        <div className="px-4 py-2">
          <Link
            href="/admin/ajuda"
            className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-secondary transition-colors"
          >
            <HelpCircle className="mr-3 h-5 w-5 text-muted-foreground" />
            Ajuda & Suporte
          </Link>
        </div>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center p-3 bg-secondary rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold">
              {profile.first_name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.role === 'super_admin' ? 'Super Admin' : 'Administrador'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
