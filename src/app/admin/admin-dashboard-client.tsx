'use client';

import Link from 'next/link';
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  DollarSign,
  Home,
  Clock,
  MoreHorizontal,
} from 'lucide-react';

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

interface Stats {
  totalProperties: number;
  activeProperties: number;
  newLeads: number;
  scheduledVisits: number;
  pendingLeads: number;
  changes: {
    properties: { value: number; type: 'positive' | 'negative' | 'neutral' };
    active: { value: number; type: 'neutral' };
    leads: { value: number; type: 'positive' | 'negative' | 'neutral' };
    visits: { value: number; type: 'neutral' };
  };
}

interface DashboardData {
  stats: Stats;
  recentLeads: any[];
  recentActivity: any[];
}

interface AdminDashboardClientProps {
  initialData: DashboardData;
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { stats, recentLeads, recentActivity } = initialData;

  const leadStatusLabels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contactado',
    visit_scheduled: 'Visita Agendada',
    negotiation: 'Negociação',
    closed: 'Fechado',
    lost: 'Perdido',
  };

  const leadStatusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    visit_scheduled: 'bg-purple-100 text-purple-700',
    negotiation: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
    lost: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-8">
      {/* New Leads Alert Banner */}
      {stats.pendingLeads > 0 && (
        <Link 
          href="/admin/crm"
          className="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {stats.pendingLeads} lead{stats.pendingLeads > 1 ? 's' : ''} pendente{stats.pendingLeads > 1 ? 's' : ''}
                </p>
                <p className="text-white/80 text-sm">Clique para ver o pipeline de leads</p>
              </div>
            </div>
            <div className="text-white/80">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta! Aqui está um resumo da sua atividade.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            {stats.changes.properties.value > 0 && (
              <span className={`flex items-center text-sm font-medium ${
                stats.changes.properties.type === 'positive' ? 'text-green-600' : 
                stats.changes.properties.type === 'negative' ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {stats.changes.properties.type === 'positive' ? '+' : stats.changes.properties.type === 'negative' ? '-' : ''}
                {stats.changes.properties.value}%
                {stats.changes.properties.type === 'positive' ? (
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                ) : stats.changes.properties.type === 'negative' ? (
                  <ArrowDownRight className="ml-1 h-4 w-4" />
                ) : null}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.totalProperties}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Imóveis</p>
        </div>

        {/* Active Properties */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600">
              {stats.changes.active.value}%
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.activeProperties}</p>
          <p className="text-sm text-muted-foreground mt-1">Imóveis Ativos</p>
        </div>

        {/* Leads */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            {stats.changes.leads.value > 0 && (
              <span className={`flex items-center text-sm font-medium ${
                stats.changes.leads.type === 'positive' ? 'text-green-600' : 
                stats.changes.leads.type === 'negative' ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {stats.changes.leads.type === 'positive' ? '+' : stats.changes.leads.type === 'negative' ? '-' : ''}
                {stats.changes.leads.value}%
                {stats.changes.leads.type === 'positive' ? (
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                ) : stats.changes.leads.type === 'negative' ? (
                  <ArrowDownRight className="ml-1 h-4 w-4" />
                ) : null}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.newLeads}</p>
          <p className="text-sm text-muted-foreground mt-1">Novos Contactos (7d)</p>
        </div>

        {/* Visits */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            {stats.changes.visits.value > 0 && (
              <span className="flex items-center text-sm font-medium text-muted-foreground">
                {stats.changes.visits.value} esta semana
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.scheduledVisits}</p>
          <p className="text-sm text-muted-foreground mt-1">Visitas Pendentes</p>
        </div>
      </div>

      {/* Properties Overview */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
              <Home className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{stats.totalProperties}</p>
              <p className="text-sm text-muted-foreground">Imóveis</p>
            </div>
          </div>
          <Link href="/admin/imoveis" className="text-sm text-yellow-600 font-medium hover:text-yellow-700">
            Ver todos os imóveis →
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-secondary rounded-xl">
            <p className="text-2xl font-bold text-foreground">{stats.totalProperties - stats.activeProperties}</p>
            <p className="text-sm text-muted-foreground">Rascunho</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-xl">
            <p className="text-2xl font-bold text-foreground">{stats.activeProperties}</p>
            <p className="text-sm text-muted-foreground">Publicados</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-xl">
            <p className="text-2xl font-bold text-foreground">{stats.newLeads}</p>
            <p className="text-sm text-muted-foreground">Contactos</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-xl">
            <p className="text-2xl font-bold text-foreground">{stats.scheduledVisits}</p>
            <p className="text-sm text-muted-foreground">Visitas</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Taxa de Publicação</span>
            <span className="text-foreground font-medium">{stats.changes.active.value}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full" style={{ width: `${stats.changes.active.value}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activities */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Atividade Recente</h2>
            <Link href="/admin/auditoria" className="text-sm text-yellow-600 font-medium hover:text-yellow-700">
              Ver todos
            </Link>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium text-yellow-600">
                        {log.profiles?.first_name || 'Sistema'}
                      </span>{' '}
                      {log.action} em {log.entity_type}
                    </p>
                    <p className="text-xs text-muted-foreground">{getRelativeTime(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Ainda não existe atividade registada.</p>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Contactos Recentes</h2>
            <Link href="/admin/crm" className="text-sm text-yellow-600 font-medium hover:text-yellow-700">
              Ver todos
            </Link>
          </div>
          
          {recentLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Ref</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead: any) => (
                    <tr key={lead.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-medium">
                            {lead.first_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{lead.first_name} {lead.last_name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {lead.properties?.reference || '-'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${leadStatusColors[lead.status] || 'bg-gray-100 text-gray-700'}`}>
                          {leadStatusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="p-1 hover:bg-secondary rounded">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Ainda não existem contactos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
