'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Building2,
  User,
  Loader2,
} from 'lucide-react';

interface Visit {
  id: string;
  scheduled_at: string;
  status: string;
  message?: string;
  visitor_name?: string;
  visitor_email?: string;
  visitor_phone?: string;
  properties?: {
    id: string;
    title: string;
    slug: string;
    municipality: string;
    reference: string;
    property_images?: { url: string; is_cover: boolean }[];
  };
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  assigned?: {
    first_name: string;
    last_name: string;
  };
}

interface VisitsCalendarClientProps {
  visits: Visit[];
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  rescheduled: 'Reagendada',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-yellow-100 text-yellow-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }
  
  return days;
}

export function VisitsCalendarClient({ visits }: VisitsCalendarClientProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (visitId: string, newStatus: 'confirmed' | 'cancelled') => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/visits/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update visit');
      }

      toast.success(newStatus === 'confirmed' ? 'Visita confirmada!' : 'Visita cancelada');
      setSelectedVisit(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error:', err);
      toast.error(err?.message || 'Erro ao atualizar visita');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];
  
  // Group visits by date
  const visitsByDate: Record<string, Visit[]> = {};
  visits.forEach((visit) => {
    const dateKey = new Date(visit.scheduled_at).toISOString().split('T')[0];
    if (!visitsByDate[dateKey]) {
      visitsByDate[dateKey] = [];
    }
    visitsByDate[dateKey].push(visit);
  });
  
  const selectedDateVisits = selectedDate ? visitsByDate[selectedDate] || [] : [];
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const handleDayClick = (dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedVisit(null);
  };

  const getPropertyImage = (visit: Visit) => {
    const images = visit.properties?.property_images || [];
    const cover = images.find(img => img.is_cover) || images[0];
    return cover?.url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário de Visitas</h1>
          <p className="text-muted-foreground mt-1">
            {visits.length} visitas agendadas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="text-lg font-semibold text-foreground min-w-[180px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm p-6 border border-border">
          <div className="grid grid-cols-7 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateKey = day.date.toISOString().split('T')[0];
              const dayVisits = visitsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const hasVisits = dayVisits.length > 0;
              const isSelected = dateKey === selectedDate;
              
              return (
                <div
                  key={index}
                  onClick={() => hasVisits && handleDayClick(dateKey)}
                  className={`min-h-[90px] p-2 rounded-xl border transition-all ${
                    !day.isCurrentMonth
                      ? 'bg-secondary/50 border-transparent text-muted-foreground'
                      : isSelected
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 ring-2 ring-yellow-500'
                      : isToday
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : hasVisits
                      ? 'bg-card border-border hover:border-yellow-200 dark:hover:border-yellow-700 cursor-pointer'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-yellow-600' : day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {dayVisits.slice(0, 2).map((visit) => (
                    <div
                      key={visit.id}
                      className={`text-xs px-2 py-1 rounded-md mb-1 truncate flex items-center gap-1 ${
                        visit.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : visit.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {visit.profiles?.avatar_url ? (
                        <img 
                          src={visit.profiles.avatar_url} 
                          alt="" 
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white">
                          {visit.profiles?.first_name?.charAt(0) || visit.visitor_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="truncate">
                        {new Date(visit.scheduled_at).toLocaleTimeString('pt-PT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                  
                  {dayVisits.length > 2 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayVisits.length - 2} mais
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Visits */}
          {selectedDate && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {new Date(selectedDate).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              
              {selectedDateVisits.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateVisits.map((visit) => (
                    <div
                      key={visit.id}
                      onClick={() => setSelectedVisit(visit)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedVisit?.id === visit.id
                          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700'
                          : 'bg-secondary hover:bg-secondary/80 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {visit.profiles?.avatar_url ? (
                          <img 
                            src={visit.profiles.avatar_url} 
                            alt={visit.profiles.first_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-medium">
                            {visit.profiles?.first_name?.charAt(0) || visit.visitor_name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {visit.profiles ? `${visit.profiles.first_name} ${visit.profiles.last_name}` : visit.visitor_name || 'Visitante'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(visit.scheduled_at).toLocaleTimeString('pt-PT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' • '}
                            {visit.properties?.reference}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[visit.status]}`}>
                          {statusLabels[visit.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Sem visitas neste dia</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Visit Details */}
          {selectedVisit && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Detalhes da Visita</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedVisit.status]}`}>
                  {statusLabels[selectedVisit.status]}
                </span>
              </div>
              
              {/* Property */}
              {selectedVisit.properties && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Imóvel</p>
                  <div className="flex gap-3 p-3 bg-secondary rounded-xl">
                    {getPropertyImage(selectedVisit) ? (
                      <img 
                        src={getPropertyImage(selectedVisit)} 
                        alt={selectedVisit.properties.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{selectedVisit.properties.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedVisit.properties.reference}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {selectedVisit.properties.municipality}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Client */}
              {(selectedVisit.profiles || selectedVisit.visitor_name) && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Cliente</p>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                    {selectedVisit.profiles?.avatar_url ? (
                      <img 
                        src={selectedVisit.profiles.avatar_url} 
                        alt={selectedVisit.profiles.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-medium text-lg">
                        {selectedVisit.profiles?.first_name?.charAt(0) || selectedVisit.visitor_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedVisit.profiles ? `${selectedVisit.profiles.first_name} ${selectedVisit.profiles.last_name}` : selectedVisit.visitor_name || 'Visitante'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedVisit.profiles?.email || selectedVisit.visitor_email}
                      </p>
                      {(selectedVisit.profiles?.phone || selectedVisit.visitor_phone) && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedVisit.profiles?.phone || selectedVisit.visitor_phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Date & Time */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Data e Hora</p>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(selectedVisit.scheduled_at).toLocaleDateString('pt-PT', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {new Date(selectedVisit.scheduled_at).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                {selectedVisit.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedVisit.id, 'confirmed')}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-medium py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Confirmar
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedVisit.id, 'cancelled')}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Cancelar
                    </button>
                  </>
                )}
                {selectedVisit.status === 'confirmed' && (selectedVisit.profiles?.phone || selectedVisit.visitor_phone) && (
                  <a 
                    href={`tel:${selectedVisit.profiles?.phone || selectedVisit.visitor_phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white font-medium py-3 rounded-xl hover:bg-yellow-600 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Ligar para Cliente
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Empty state when no date selected */}
          {!selectedDate && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Clique num dia com visitas para ver os detalhes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
