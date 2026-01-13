import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  User,
  MoreHorizontal,
  Check,
  X,
  ChevronRight,
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

const statusLabels: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  visit_scheduled: 'Visita Agendada',
  negotiation: 'Negociação',
  closed: 'Fechado',
  lost: 'Perdido',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  visit_scheduled: 'bg-purple-100 text-purple-700',
  negotiation: 'bg-orange-100 text-orange-700',
  closed: 'bg-green-100 text-green-700',
  lost: 'bg-yellow-100 text-yellow-700',
};

export default async function CRMPage() {
  const leads = await getLeads();

  const leadsByStatus = {
    new: leads.filter((l: any) => l.status === 'new'),
    contacted: leads.filter((l: any) => l.status === 'contacted'),
    visit_scheduled: leads.filter((l: any) => l.status === 'visit_scheduled'),
    negotiation: leads.filter((l: any) => l.status === 'negotiation'),
    closed: leads.filter((l: any) => l.status === 'closed'),
    lost: leads.filter((l: any) => l.status === 'lost'),
  };

  // Get first lead for detail view
  const selectedLead = leads[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenancy Applications</h1>
          <p className="text-muted-foreground mt-1">
            {leads.length} leads no total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:bg-secondary transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <span className="text-sm text-muted-foreground">All tenants</span>
        </div>
      </div>

      {/* Main Grid - Table + Detail */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Table */}
        <div className="lg:col-span-3 bg-card rounded-2xl shadow-sm overflow-hidden border border-border">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tenant by name..."
                className="w-full pl-12 pr-4 py-2.5 bg-secondary border-0 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Total Income</th>
                  <th className="px-4 py-3 font-medium">Income to Rent</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {leads.length > 0 ? (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-secondary cursor-pointer transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">
                          {getRelativeTime(lead.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-medium">
                            {lead.first_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {lead.first_name} {lead.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">€5,000/mo</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">2.5x</span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="p-1 hover:bg-secondary rounded">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Ainda não existem contactos.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm p-6 border border-border">
          {selectedLead ? (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                  {selectedLead.first_name?.charAt(0) || 'U'}
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {selectedLead.first_name} {selectedLead.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">Tenant</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Applied</span>
                  <span className="text-sm font-medium text-foreground">{getRelativeTime(selectedLead.created_at)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Occupants</span>
                  <span className="text-sm font-medium text-foreground">1 person</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedLead.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[selectedLead.status] || selectedLead.status}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedLead.email}</span>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedLead.phone}</span>
                  </div>
                )}
                {selectedLead.properties && (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ref: {selectedLead.properties.reference}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-3 rounded-xl hover:bg-green-600 transition-colors">
                  <Check className="h-4 w-4" />
                  Accept
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white font-medium py-3 rounded-xl hover:bg-yellow-600 transition-colors">
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione um contacto para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
