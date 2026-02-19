'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  User,
  Clock,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Building2,
  MessageSquare,
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
  properties?: { id: string; title: string; reference: string; slug?: string } | null;
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
  propertyLeads: Lead[];
  contactLeads: Lead[];
  scheduledVisits?: ScheduledVisit[];
}

const pipelineStages = [
  { key: 'new', label: 'Por Contactar', color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-300 dark:border-blue-700' },
  { key: 'contacted', label: 'Contactado', color: 'bg-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30', borderColor: 'border-yellow-300 dark:border-yellow-700' },
  { key: 'visit_scheduled', label: 'Visita Agendada', color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-300 dark:border-purple-700' },
  { key: 'negotiation', label: 'Negociação', color: 'bg-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-300 dark:border-orange-700' },
  { key: 'closed', label: 'Fechado', color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-300 dark:border-green-700' },
];

// ── Shared Kanban Column ──────────────────────────────────────────────────────
function KanbanColumn({
  stage,
  leads,
  draggedId,
  dragOverStage,
  openMenuId,
  showPropertyBadge,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenMenu,
  onViewDetails,
  onDelete,
}: {
  stage: typeof pipelineStages[0];
  leads: Lead[];
  draggedId: string | null;
  dragOverStage: string | null;
  openMenuId: string | null;
  showPropertyBadge: boolean;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, key: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, key: string) => void;
  onOpenMenu: (id: string | null) => void;
  onViewDetails: (lead: Lead) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`rounded-2xl ${stage.bgColor} p-4 min-h-[300px] transition-all duration-200 ${
        dragOverStage === stage.key ? `ring-2 ring-offset-2 ${stage.borderColor} ring-offset-background` : ''
      }`}
      onDragOver={(e) => onDragOver(e, stage.key)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, stage.key)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <h3 className="font-semibold text-foreground text-sm">{stage.label}</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>
      <div className="space-y-3">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <div
              key={lead.id}
              draggable
              onDragStart={(e) => onDragStart(e, lead)}
              onDragEnd={onDragEnd}
              className={`bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                draggedId === lead.id ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {lead.first_name?.charAt(0)?.toUpperCase() || 'L'}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenMenu(openMenuId === lead.id ? null : lead.id); }}
                    className="p-1 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {openMenuId === lead.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                      <button onClick={() => onViewDetails(lead)} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors w-full text-left">
                        <Eye className="h-4 w-4" /> Ver Detalhes
                      </button>
                      <hr className="my-1 border-border" />
                      <button onClick={() => onDelete(lead.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 mb-2">
                <p className="font-medium text-foreground text-sm truncate">
                  {lead.first_name || 'Lead'} {lead.last_name || ''}
                </p>
                {lead.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{lead.message}</p>
                )}
              </div>
              {showPropertyBadge && lead.properties && (
                <Link
                  href={`/imoveis/${lead.properties.slug || lead.properties.id}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-yellow-600 hover:text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 px-2 py-1 rounded-lg mb-2 truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{lead.properties.title || lead.properties.reference}</span>
                </Link>
              )}
              <div className="space-y-1">
                {lead.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{lead.phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{getRelativeTime(lead.created_at)}</span>
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
  );
}

// ── Pipeline Board (one per tab) ──────────────────────────────────────────────
function PipelineBoard({ initialLeads, showPropertyBadge }: { initialLeads: Lead[]; showPropertyBadge: boolean }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);

  const byStatus: Record<string, Lead[]> = {};
  for (const s of pipelineStages) byStatus[s.key] = leads.filter((l) => l.status === s.key);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => { setDraggedLead(null); setDragOverStage(null); };
  const handleDragOver = (e: React.DragEvent, key: string) => { e.preventDefault(); setDragOverStage(key); };
  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedLead || draggedLead.status === newStatus) { setDraggedLead(null); return; }
    const prev = draggedLead.status;
    setLeads(ls => ls.map(l => l.id === draggedLead.id ? { ...l, status: newStatus } : l));
    try {
      const res = await fetch(`/api/leads/${draggedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Movido para "${pipelineStages.find(s => s.key === newStatus)?.label}"`);
    } catch {
      setLeads(ls => ls.map(l => l.id === draggedLead.id ? { ...l, status: prev } : l));
      toast.error('Erro ao mover lead. Tente novamente.');
    }
    setDraggedLead(null);
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este lead?')) return;
    const prev = [...leads];
    setLeads(ls => ls.filter(l => l.id !== leadId));
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Lead eliminado com sucesso');
    } catch {
      setLeads(prev);
      toast.error('Erro ao eliminar lead.');
    }
  };

  const viewDetails = (lead: Lead) => { setSelectedLead(lead); setShowModal(true); setOpenMenuId(null); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <KanbanColumn
            key={stage.key}
            stage={stage}
            leads={byStatus[stage.key] || []}
            draggedId={draggedLead?.id ?? null}
            dragOverStage={dragOverStage}
            openMenuId={openMenuId}
            showPropertyBadge={showPropertyBadge}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onOpenMenu={setOpenMenuId}
            onViewDetails={viewDetails}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Detalhes do Lead</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">✕</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedLead.first_name?.charAt(0)?.toUpperCase() || 'L'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedLead.first_name || 'Lead'} {selectedLead.last_name || ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pipelineStages.find(s => s.key === selectedLead.status)?.label || selectedLead.status}
                    </p>
                  </div>
                </div>
                {selectedLead.properties && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Imóvel</p>
                    <Link href={`/imoveis/${selectedLead.properties.slug || selectedLead.properties.id}`} target="_blank" className="text-sm font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {selectedLead.properties.title || selectedLead.properties.reference}
                    </Link>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{selectedLead.email || 'Não disponível'}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                    <p className="text-sm font-medium text-foreground">{selectedLead.phone || 'Não disponível'}</p>
                  </div>
                </div>
                {selectedLead.message && (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Mensagem</p>
                    <p className="text-sm text-foreground">{selectedLead.message}</p>
                  </div>
                )}
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Criado em</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedLead.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {selectedLead.phone && (
                  <a href={`tel:${selectedLead.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-medium transition-colors">
                    <Phone className="h-4 w-4" /> Ligar
                  </a>
                )}
                {selectedLead.email && (
                  <a href={`mailto:${selectedLead.email}`} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-medium transition-colors">
                    <Mail className="h-4 w-4" /> Email
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

// ── Main CRM Client ───────────────────────────────────────────────────────────
export function CRMClient({ propertyLeads, contactLeads, scheduledVisits = [] }: CRMClientProps) {
  const [activeTab, setActiveTab] = useState<'property' | 'contact'>('property');
  const visits = scheduledVisits;

  const totalLeads = propertyLeads.length + contactLeads.length;
  const newCount = [...propertyLeads, ...contactLeads].filter(l => l.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM — Pipeline de Leads</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {totalLeads} leads no total
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {newCount} por contactar
              </span>
            )}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Arraste os cards para mover entre etapas</p>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'property'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Leads de Imóveis
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'property' ? 'bg-yellow-100 text-yellow-700' : 'bg-secondary text-muted-foreground'
          }`}>
            {propertyLeads.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'contact'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Contactos Gerais
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'contact' ? 'bg-blue-100 text-blue-700' : 'bg-secondary text-muted-foreground'
          }`}>
            {contactLeads.length}
          </span>
        </button>
      </div>

      {/* Active Pipeline Board */}
      {activeTab === 'property' ? (
        <PipelineBoard key="property" initialLeads={propertyLeads} showPropertyBadge={true} />
      ) : (
        <PipelineBoard key="contact" initialLeads={contactLeads} showPropertyBadge={false} />
      )}

      {/* Scheduled Visits */}
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
                    <p className="text-xs text-muted-foreground truncate">{visit.profiles?.email}</p>
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
                      {new Date(visit.scheduled_at).toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' às '}
                      {new Date(visit.scheduled_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {visit.properties && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{visit.properties.reference} — {visit.properties.municipality}</span>
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
    </div>
  );
}
