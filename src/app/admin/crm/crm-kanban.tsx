'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Building2, GripVertical, MoreVertical } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  properties?: {
    id: string;
    title: string;
    reference: string;
  };
  assigned?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface CRMKanbanProps {
  leadsByStatus: Record<string, Lead[]>;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
}

const statusOrder = ['new', 'contacted', 'visit_scheduled', 'negotiation', 'closed', 'lost'];

export function CRMKanban({ leadsByStatus, statusLabels, statusColors }: CRMKanbanProps) {
  const router = useRouter();
  const supabase = createClient();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStatus(null);

    if (!draggedLead || draggedLead.status === newStatus) {
      setDraggedLead(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', draggedLead.id);

      if (error) throw error;

      toast.success(`Contacto movido para "${statusLabels[newStatus]}"`);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar estado do contacto');
    }

    setDraggedLead(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusOrder.map((status) => {
        const leads = leadsByStatus[status] || [];
        const isDropTarget = dragOverStatus === status;

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-80 bg-muted/30 rounded-lg ${
              isDropTarget ? 'ring-2 ring-gold-500 ring-offset-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={statusColors[status]}>
                    {statusLabels[status]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({leads.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[400px]">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                  className={`bg-white rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                    draggedLead?.id === lead.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          {lead.first_name} {lead.last_name}
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/crm/${lead.id}`}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1.5" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1.5" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.properties && (
                      <div className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1.5" />
                        <span>{lead.properties.reference}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(lead.created_at)}
                    </span>
                    {lead.assigned && (
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-gold-100 flex items-center justify-center text-xs text-gold-700">
                          {lead.assigned.first_name?.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {leads.length === 0 && (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  Sem contactos
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
