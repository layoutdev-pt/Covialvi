import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Phone,
  Mail,
  Building2,
  User,
  Clock,
  MapPin,
} from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getLeads() {
  const supabase = createClient();
  const { data } = await supabase
    .from('leads')
    .select(`
      *,
      properties:property_id (id, title, reference),
      assigned:assigned_to (id, first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  return data || [];
}

const pipelineStages = [
  { key: 'new', label: 'Novo', color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { key: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { key: 'negotiation', label: 'Negociação', color: 'bg-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  { key: 'closed', label: 'Fechado', color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-950/30' },
];

const sourceLabels: Record<string, string> = {
  homepage_sell_wizard: 'Wizard Venda',
  contact_form: 'Formulário Contacto',
  property_inquiry: 'Pedido Imóvel',
  phone: 'Telefone',
  email: 'Email',
  referral: 'Referência',
  other: 'Outro',
};

export default async function CRMPage() {
  const leads = await getLeads();

  const leadsByStatus: Record<string, any[]> = {
    new: leads.filter((l: any) => l.status === 'new'),
    contacted: leads.filter((l: any) => l.status === 'contacted'),
    visit_scheduled: leads.filter((l: any) => l.status === 'visit_scheduled'),
    negotiation: leads.filter((l: any) => l.status === 'negotiation'),
    closed: leads.filter((l: any) => l.status === 'closed'),
  };

  const newLeadsCount = leadsByStatus.new.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de Leads</h1>
          <p className="text-muted-foreground mt-1">
            {leads.length} leads no total
            {newLeadsCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {newLeadsCount} novo{newLeadsCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Pipeline Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <div key={stage.key} className={`rounded-2xl ${stage.bgColor} p-4`}>
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold text-foreground text-sm">{stage.label}</h3>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full">
                {leadsByStatus[stage.key]?.length || 0}
              </span>
            </div>

            {/* Lead Cards */}
            <div className="space-y-3">
              {leadsByStatus[stage.key]?.length > 0 ? (
                leadsByStatus[stage.key].map((lead: any) => (
                  <div
                    key={lead.id}
                    className="bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* Lead Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {lead.first_name?.charAt(0) || 'L'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {lead.first_name || 'Lead'} {lead.last_name || ''}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {sourceLabels[lead.source] || lead.source || 'Desconhecido'}
                        </p>
                      </div>
                    </div>

                    {/* Lead Info */}
                    {lead.message && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {lead.message}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1">
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{lead.phone}</span>
                        </div>
                      )}
                      {lead.email && !lead.email.includes('@temp.covialvi.com') && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(lead.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Sem leads</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
