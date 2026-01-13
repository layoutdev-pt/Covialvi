import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  User,
  Building2,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';
import { formatDate, getRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getLeads(): Promise<any[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('leads')
    .select(`
      *,
      properties (title, reference, slug),
      profiles:assigned_to (first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  return data || [];
}

async function getLeadStats() {
  const supabase = createClient();
  
  const statuses = ['new', 'contacted', 'visit_scheduled', 'negotiation', 'closed', 'lost'];
  const stats: Record<string, number> = {};
  
  for (const status of statuses) {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    stats[status] = count || 0;
  }
  
  return stats;
}

const statusLabels: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  visit_scheduled: 'Visita Agendada',
  negotiation: 'Negociação',
  closed: 'Fechado',
  lost: 'Perdido',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  visit_scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
  negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
  closed: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default async function AdminLeadsPage() {
  const [leads, stats] = await Promise.all([getLeads(), getLeadStats()]);

  const pipelineStages = [
    { key: 'new', label: 'Novos', icon: MessageSquare },
    { key: 'contacted', label: 'Contactados', icon: Phone },
    { key: 'visit_scheduled', label: 'Visita Agendada', icon: Calendar },
    { key: 'negotiation', label: 'Negociação', icon: Building2 },
    { key: 'closed', label: 'Fechados', icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Contactos</h1>
          <p className="text-muted-foreground">
            {leads.length} contactos no total
          </p>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <Card key={stage.key}>
            <CardContent className="p-4 text-center">
              <stage.icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats[stage.key] || 0}</p>
              <p className="text-sm text-muted-foreground">{stage.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome ou e-mail..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Estados</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Atribuído a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unassigned">Não Atribuído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Contacto
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Imóvel
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Atribuído
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Data
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.length > 0 ? (
              leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {lead.first_name} {lead.last_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.properties ? (
                      <Link
                        href={`/imoveis/${lead.properties.slug}`}
                        className="text-sm hover:text-gold-600"
                      >
                        <span className="font-medium">{lead.properties.reference}</span>
                        <br />
                        <span className="text-muted-foreground truncate max-w-[150px] block">
                          {lead.properties.title}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[lead.status] || 'bg-gray-100'}>
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {lead.profiles ? (
                      <span className="text-sm">
                        {lead.profiles.first_name} {lead.profiles.last_name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Não atribuído</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      {getRelativeTime(lead.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Link href={`/admin/contactos/${lead.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Ainda não existem contactos.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
