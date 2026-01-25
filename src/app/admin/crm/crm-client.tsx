'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  User,
  Clock,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Calendar,
  MapPin,
} from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Lead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
  properties?: { id: string; title: string; reference: string } | null;
  assigned?: { id: string; first_name: string; last_name: string } | null;
}

interface ScheduledVisit {
  id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  properties?: { id: string; title: string; reference: string; municipality: string } | null;
  profiles?: { id: string; first_name: string; last_name: string; email: string; phone?: string } | null;
}

interface CRMClientProps {
  initialLeads: Lead[];
  scheduledVisits?: ScheduledVisit[];
}

const pipelineStages = [
  { key: 'new', label: 'Novo', color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-300 dark:border-blue-700' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-300 dark:border-yellow-700' },
  { key: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-300 dark:border-purple-700' },
  { key: 'negotiation', label: 'Negociação', color: 'bg-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-300 dark:border-orange-700' },
  { key: 'closed', label: 'Fechado', color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-300 dark:border-green-700' },
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

export function CRMClient({ initialLeads, scheduledVisits = [] }: CRMClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [visits] = useState<ScheduledVisit[]>(scheduledVisits);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const leadsByStatus: Record<string, Lead[]> = {
    new: leads.filter((l) => l.status === 'new'),
    contacted: leads.filter((l) => l.status === 'contacted'),
    visit_scheduled: leads.filter((l) => l.status === 'visit_scheduled'),
    negotiation: leads.filter((l) => l.status === 'negotiation'),
    closed: leads.filter((l) => l.status === 'closed'),
  };

  const newLeadsCount = leadsByStatus.new.length;

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedLead || draggedLead.status === newStatus) {
      setDraggedLead(null);
      return;
    }

    const previousStatus = draggedLead.status;
    
    // Optimistic update
    setLeads(prev => prev.map(lead => 
      lead.id === draggedLead.id ? { ...lead, status: newStatus } : lead
    ));

    try {
      const response = await fetch(`/api/leads/${draggedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar lead');
      }

      const stageLabel = pipelineStages.find(s => s.key === newStatus)?.label || newStatus;
      toast.success(`Lead movido para "${stageLabel}"`);
    } catch (error) {
      // Revert on error
      setLeads(prev => prev.map(lead => 
        lead.id === draggedLead.id ? { ...lead, status: previousStatus } : lead
      ));
      toast.error('Erro ao mover lead. Tente novamente.');
    }

    setDraggedLead(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este lead?')) return;

    const previousLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setOpenMenuId(null);

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao eliminar lead');
      }

      toast.success('Lead eliminado com sucesso');
    } catch (error) {
      setLeads(previousLeads);
      toast.error('Erro ao eliminar lead. Tente novamente.');
    }
  };

  const viewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
    setOpenMenuId(null);
  };

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
        <p className="text-sm text-muted-foreground">
          Arraste os cards para mover leads entre etapas
        </p>
      </div>

      {/* Pipeline Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <div
            key={stage.key}
            className={`rounded-2xl ${stage.bgColor} p-4 min-h-[400px] transition-all duration-200 ${
              dragOverStage === stage.key ? `ring-2 ring-offset-2 ${stage.borderColor} ring-offset-background` : ''
            }`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
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
                leadsByStatus[stage.key].map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    className={`bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                      draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    {/* Drag Handle & Menu */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {lead.first_name?.charAt(0) || 'L'}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                          }}
                          className="p-1 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {openMenuId === lead.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                            <button
                              onClick={() => viewLeadDetails(lead)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors w-full text-left"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Detalhes
                            </button>
                            <hr className="my-1 border-border" />
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lead Name */}
                    <div className="min-w-0 mb-2">
                      <p className="font-medium text-foreground text-sm truncate">
                        {lead.first_name || 'Lead'} {lead.last_name || ''}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {sourceLabels[lead.source || ''] || lead.source || 'Desconhecido'}
                      </p>
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
                <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl">
                  <User className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {dragOverStage === stage.key ? 'Solte aqui' : 'Sem leads'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Visits Section */}
      {visits.length > 0 && (
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-foreground">Visitas Marcadas</h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {visits.length} visita{visits.length > 1 ? 's' : ''} agendada{visits.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className={`p-4 rounded-xl border ${
                  visit.status === 'confirmed'
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium">
                    {visit.profiles?.first_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {visit.profiles?.first_name || 'Utilizador'} {visit.profiles?.last_name || ''}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {visit.profiles?.email}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    visit.status === 'confirmed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {visit.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(visit.scheduled_at).toLocaleDateString('pt-PT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })} às {new Date(visit.scheduled_at).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  
                  {visit.properties && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{visit.properties.reference} - {visit.properties.municipality}</span>
                    </div>
                  )}
                  
                  {visit.profiles?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{visit.profiles.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Detalhes do Lead</h2>
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-medium">
                    {selectedLead.first_name?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedLead.first_name || 'Lead'} {selectedLead.last_name || ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {sourceLabels[selectedLead.source || ''] || selectedLead.source || 'Desconhecido'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedLead.email && !selectedLead.email.includes('@temp.covialvi.com') 
                        ? selectedLead.email 
                        : 'Não disponível'}
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedLead.phone || 'Não disponível'}
                    </p>
                  </div>
                </div>

                {selectedLead.message && (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Mensagem</p>
                    <p className="text-sm text-foreground">{selectedLead.message}</p>
                  </div>
                )}

                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Estado Atual</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${pipelineStages.find(s => s.key === selectedLead.status)?.color || 'bg-gray-500'}`} />
                    <p className="text-sm font-medium text-foreground">
                      {pipelineStages.find(s => s.key === selectedLead.status)?.label || selectedLead.status}
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Criado em</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedLead.created_at).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-medium transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Ligar
                  </a>
                )}
                {selectedLead.email && !selectedLead.email.includes('@temp.covialvi.com') && (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-medium transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
