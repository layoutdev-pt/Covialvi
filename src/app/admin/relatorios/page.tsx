import { createServiceClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileSpreadsheet,
  Building2,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Search,
  MapPin,
  Home,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createServiceClient();
  
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    { count: totalProperties },
    { count: publishedProperties },
    { count: totalLeads },
    { count: newLeadsThisMonth },
    { count: newLeadsLastMonth },
    { count: totalVisits },
    { count: completedVisits },
    { count: totalUsers },
    { data: totalViewsData },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', thisMonth.toISOString()),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString()),
    supabase.from('visits').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('properties').select('views_count'),
  ]);

  const totalViews = (totalViewsData || []).reduce((sum: number, p: any) => sum + (p.views_count || 0), 0);
  const leadsChange = newLeadsLastMonth ? Math.round(((newLeadsThisMonth || 0) - newLeadsLastMonth) / newLeadsLastMonth * 100) : 0;

  return {
    totalProperties: totalProperties || 0,
    publishedProperties: publishedProperties || 0,
    totalLeads: totalLeads || 0,
    newLeadsThisMonth: newLeadsThisMonth || 0,
    leadsChange,
    totalVisits: totalVisits || 0,
    completedVisits: completedVisits || 0,
    totalUsers: totalUsers || 0,
    totalViews,
    conversionRate: totalLeads ? Math.round((completedVisits || 0) / totalLeads * 100) : 0,
  };
}

async function getLeadsByStatus() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('leads')
    .select('status');

  const counts: Record<string, number> = {};
  (data || []).forEach((lead: any) => {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
  });

  return counts;
}

async function getPropertiesByType() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('properties')
    .select('nature');

  const counts: Record<string, number> = {};
  (data || []).forEach((prop: any) => {
    counts[prop.nature] = (counts[prop.nature] || 0) + 1;
  });

  return counts;
}

async function getTopViewedProperties() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('properties')
    .select('id, title, slug, views_count, municipality, price')
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(5);

  return data || [];
}

async function getPropertiesByLocation() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('properties')
    .select('municipality')
    .eq('status', 'published');

  const counts: Record<string, number> = {};
  (data || []).forEach((prop: any) => {
    if (prop.municipality) {
      counts[prop.municipality] = (counts[prop.municipality] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

async function getLeadSources() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('leads')
    .select('source');

  const counts: Record<string, number> = {};
  (data || []).forEach((lead: any) => {
    const source = lead.source || 'direct';
    counts[source] = (counts[source] || 0) + 1;
  });

  return counts;
}

const statusLabels: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  visit_scheduled: 'Visita Agendada',
  negotiation: 'Negociação',
  closed: 'Fechado',
  lost: 'Perdido',
};

const natureLabels: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Moradia',
  land: 'Terreno',
  commercial: 'Comercial',
  warehouse: 'Armazém',
  office: 'Escritório',
  garage: 'Garagem',
  shop: 'Loja',
};

const sourceLabels: Record<string, string> = {
  property_page: 'Página do Imóvel',
  contact_page: 'Página de Contacto',
  direct: 'Direto',
  whatsapp: 'WhatsApp',
  phone: 'Telefone',
};

export default async function ReportsPage() {
  const [stats, leadsByStatus, propertiesByType, topViewed, byLocation, leadSources] = await Promise.all([
    getStats(),
    getLeadsByStatus(),
    getPropertiesByType(),
    getTopViewedProperties(),
    getPropertiesByLocation(),
    getLeadSources(),
  ]);

  const exportOptions = [
    { name: 'Imóveis', description: 'Lista completa de imóveis', icon: Building2 },
    { name: 'Contactos', description: 'Lista de leads e contactos', icon: Users },
    { name: 'Visitas', description: 'Histórico de visitas', icon: Calendar },
    { name: 'Utilizadores', description: 'Lista de utilizadores registados', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios e Estatísticas</h1>
          <p className="text-muted-foreground">
            Análise de desempenho e exportação de dados
          </p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                +12%
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.totalProperties}</p>
              <p className="text-sm text-muted-foreground">Total de Imóveis</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.publishedProperties} publicados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                +{stats.newLeadsThisMonth}
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total de Contactos</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.newLeadsThisMonth} este mês
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                +8%
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.totalVisits}</p>
              <p className="text-sm text-muted-foreground">Total de Visitas</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedVisits} concluídas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gold-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-gold-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                +5%
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{stats.conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contactos → Visitas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Analytics Row - Views & Top Properties */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Total Views Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Visualizações de Imóveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-foreground">{stats.totalViews.toLocaleString('pt-PT')}</p>
              <p className="text-muted-foreground mt-2">Total de visualizações</p>
            </div>
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Imóveis Mais Vistos</h4>
              {topViewed.map((prop: any, index: number) => (
                <div key={prop.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">{prop.title}</p>
                      <p className="text-xs text-muted-foreground">{prop.municipality || 'Portugal'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {prop.views_count || 0}
                  </div>
                </div>
              ))}
              {topViewed.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Sem dados disponíveis</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Properties by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Imóveis por Localização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byLocation.map(([location, count]: [string, number]) => {
                const total = byLocation.reduce((sum: number, [, c]: [string, number]) => sum + c, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return (
                  <div key={location} className="flex items-center">
                    <div className="w-32 text-sm truncate">{location}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
              {byLocation.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Sem dados disponíveis</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Contactos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsByStatus).map(([status, count]) => {
                const total = Object.values(leadsByStatus).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return (
                  <div key={status} className="flex items-center">
                    <div className="w-32 text-sm">{statusLabels[status] || status}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
              {Object.keys(leadsByStatus).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Sem dados disponíveis
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Properties by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Imóveis por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(propertiesByType).map(([nature, count]) => {
                const total = Object.values(propertiesByType).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return (
                  <div key={nature} className="flex items-center">
                    <div className="w-32 text-sm">{natureLabels[nature] || nature}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
              {Object.keys(propertiesByType).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Sem dados disponíveis
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {exportOptions.map((option) => (
              <div
                key={option.name}
                className="p-4 border border-border rounded-lg hover:border-gold-300 hover:bg-gold-50 transition-colors"
              >
                <option.icon className="h-8 w-8 text-gold-500 mb-3" />
                <h3 className="font-medium">{option.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {option.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GDPR Export */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Exportação RGPD</h3>
              <p className="text-sm text-blue-700 mt-1">
                Exporte todos os dados de um utilizador específico para cumprir com pedidos RGPD.
                Inclui perfil, favoritos, visitas e histórico de atividade.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Exportar Dados de Utilizador
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
