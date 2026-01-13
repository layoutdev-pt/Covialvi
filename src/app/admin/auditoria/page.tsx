import { createServiceClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  Filter,
  FileText,
  User,
  Building2,
  Calendar,
  Shield,
  Eye,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getAuditLogs() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (first_name, last_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return data || [];
}

const actionLabels: Record<string, string> = {
  create: 'Criou',
  update: 'Atualizou',
  delete: 'Eliminou',
  login: 'Iniciou sessão',
  logout: 'Terminou sessão',
  view: 'Visualizou',
  export: 'Exportou',
  assign: 'Atribuiu',
  status_change: 'Alterou estado',
};

const entityLabels: Record<string, string> = {
  property: 'Imóvel',
  lead: 'Contacto',
  visit: 'Visita',
  user: 'Utilizador',
  profile: 'Perfil',
  note: 'Nota',
  session: 'Sessão',
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-yellow-100 text-yellow-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-gray-100 text-gray-700',
  view: 'bg-yellow-100 text-yellow-700',
  export: 'bg-orange-100 text-orange-700',
  assign: 'bg-indigo-100 text-indigo-700',
  status_change: 'bg-cyan-100 text-cyan-700',
};

const entityIcons: Record<string, any> = {
  property: Building2,
  lead: User,
  visit: Calendar,
  user: User,
  profile: User,
  session: Shield,
};

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registo de Auditoria</h1>
          <p className="text-muted-foreground">
            Histórico de todas as ações realizadas no sistema
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar Logs
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por utilizador ou ação..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Ações</SelectItem>
            {Object.entries(actionLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Entidades</SelectItem>
            {Object.entries(entityLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="7">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Últimas 24 horas</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Data/Hora
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Utilizador
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Ação
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Entidade
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                IP
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Detalhes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length > 0 ? (
              logs.map((log: any) => {
                const EntityIcon = entityIcons[log.entity_type] || FileText;
                return (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">
                        {formatDate(log.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-sm font-medium">
                          {log.profiles?.first_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {log.profiles?.first_name} {log.profiles?.last_name || 'Sistema'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.profiles?.email || 'sistema@covialvi.pt'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={actionColors[log.action] || 'bg-gray-100 text-gray-700'}>
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <EntityIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {entityLabels[log.entity_type] || log.entity_type}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground">
                            #{log.entity_id.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground font-mono">
                        {log.ip_address || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Ainda não existem registos de auditoria.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            A mostrar {logs.length} registos
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Seguinte
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
