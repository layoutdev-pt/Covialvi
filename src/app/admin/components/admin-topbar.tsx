'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  Search,
  ChevronDown,
  User,
  Settings,
  ExternalLink,
  Plus,
  Users,
  Calendar,
  Building2,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: 'lead' | 'visit' | 'property' | 'contact';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

interface AdminTopbarProps {
  profile: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role: string;
  };
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('pt-PT');
}

export function AdminTopbar({ profile }: AdminTopbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch real notifications from database
  useEffect(() => {
    async function fetchNotifications() {
      setIsLoading(true);
      try {
        const notifs: Notification[] = [];

        // Get recent leads (last 7 days)
        const { data: leads } = await supabase
          .from('leads')
          .select('id, first_name, last_name, created_at, status')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        if (leads) {
          leads.forEach((lead: any) => {
            notifs.push({
              id: `lead-${lead.id}`,
              type: 'lead',
              title: 'Novo contacto recebido',
              description: `${lead.first_name} ${lead.last_name}`,
              time: lead.created_at,
              read: lead.status !== 'new',
              link: '/admin/crm',
            });
          });
        }

        // Get recent visits (pending/confirmed)
        const { data: visits } = await supabase
          .from('visits')
          .select(`
            id, 
            scheduled_at, 
            status, 
            created_at,
            profiles:user_id (first_name, last_name),
            properties:property_id (reference)
          `)
          .in('status', ['pending', 'confirmed'])
          .gte('scheduled_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        if (visits) {
          visits.forEach((visit: any) => {
            const statusText = visit.status === 'pending' ? 'Nova visita agendada' : 'Visita confirmada';
            notifs.push({
              id: `visit-${visit.id}`,
              type: 'visit',
              title: statusText,
              description: `${visit.profiles?.first_name || 'Cliente'} - Ref: ${visit.properties?.reference || 'N/A'}`,
              time: visit.created_at,
              read: visit.status === 'confirmed',
              link: '/admin/visitas',
            });
          });
        }

        // Sort by time (most recent first)
        notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Take only the 10 most recent
        const recentNotifs = notifs.slice(0, 10);
        
        setNotifications(recentNotifs);
        setUnreadCount(recentNotifs.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();

    // Set up real-time subscription for new leads
    const leadsChannel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload: any) => {
        const lead = payload.new;
        const newNotif: Notification = {
          id: `lead-${lead.id}`,
          type: 'lead',
          title: 'Novo contacto recebido',
          description: `${lead.first_name} ${lead.last_name}`,
          time: lead.created_at,
          read: false,
          link: '/admin/crm',
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    // Set up real-time subscription for new visits
    const visitsChannel = supabase
      .channel('visits-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, (payload: any) => {
        const visit = payload.new;
        const newNotif: Notification = {
          id: `visit-${visit.id}`,
          type: 'visit',
          title: 'Nova visita agendada',
          description: 'Novo pedido de visita',
          time: visit.created_at,
          read: false,
          link: '/admin/visitas',
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(visitsChannel);
    };
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - (notification.read ? 0 : 1)));
    
    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'visit':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'property':
        return <Building2 className="h-4 w-4 text-green-500" />;
      case 'contact':
        return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 h-20 bg-card border-b border-border flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar imóveis, contactos..."
            className="w-full pl-12 pr-4 py-3 bg-secondary border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-background transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Add Property Button */}
        <Link href="/admin/imoveis/novo-simple">
          <button className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all">
            <Plus className="h-4 w-4" />
            Novo Imóvel
          </button>
        </Link>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lg border-gray-100">
            <DropdownMenuLabel className="flex items-center justify-between py-3">
              <span className="font-semibold">Notificações</span>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Marcar como lidas
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading ? (
              <div className="py-6 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 py-3 cursor-pointer ${!notification.read ? 'bg-yellow-50/50' : ''}`}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{notification.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{getRelativeTime(notification.time)}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Sem notificações</p>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/crm" className="w-full text-center justify-center text-yellow-600 font-medium py-2">
                Ver todos os contactos
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Site */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground p-3 hover:bg-secondary rounded-xl transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden md:inline">Ver Site</span>
        </Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold">
                {profile.first_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground">
                  {profile.first_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-gray-100">
            <DropdownMenuLabel className="py-3">
              <div>
                <p className="font-semibold text-gray-900">{profile.first_name} {profile.last_name}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="py-2.5">
              <Link href="/admin/perfil" className="flex items-center">
                <User className="mr-3 h-4 w-4 text-gray-400" />
                O Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2.5">
              <Link href="/admin/definicoes" className="flex items-center">
                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                Definições
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-yellow-600 py-2.5">
              <LogOut className="mr-3 h-4 w-4" />
              Terminar Sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
