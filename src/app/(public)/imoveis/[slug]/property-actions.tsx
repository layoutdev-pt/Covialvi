'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PropertyActionsProps {
  propertyId: string;
  propertyTitle: string;
  propertyReference: string;
}

export function PropertyActions({ 
  propertyId, 
  propertyTitle, 
  propertyReference,
}: PropertyActionsProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  const supabase = createClient();

  // Check if property is already favorited on mount
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) {
        setIsCheckingFavorite(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', propertyId)
          .maybeSingle();
        
        if (!error && data) {
          setIsFavorited(true);
        }
      } catch (err) {
        console.error('Error checking favorite:', err);
      } finally {
        setIsCheckingFavorite(false);
      }
    };
    
    checkFavorite();
  }, [user, propertyId]);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Precisa de iniciar sessão para guardar favoritos.', {
        action: {
          label: 'Entrar',
          onClick: () => router.push(`/auth/login?redirect=/imoveis/${propertyReference}`),
        },
      });
      return;
    }

    setIsTogglingFavorite(true);
    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        if (error) throw error;
        setIsFavorited(false);
        toast.success('Removido dos favoritos');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
        setIsFavorited(true);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error: any) {
      console.error('Favorites error:', error);
      toast.error(error?.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleScheduleVisitClick = () => {
    if (!user) {
      toast.error('Precisa de iniciar sessão para agendar visitas.', {
        action: {
          label: 'Entrar',
          onClick: () => router.push(`/auth/login?redirect=/imoveis/${propertyReference}`),
        },
      });
      return;
    }
    setShowVisitModal(true);
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitDate || !visitTime) {
      toast.error('Por favor, selecione a data e hora da visita.');
      return;
    }

    setIsSchedulingVisit(true);
    try {
      const scheduledAt = new Date(`${visitDate}T${visitTime}`);
      
      const { error } = await supabase.from('visits').insert({
        property_id: propertyId,
        user_id: user!.id,
        scheduled_at: scheduledAt.toISOString(),
        notes: visitMessage || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Visita agendada com sucesso! Entraremos em contacto para confirmar.');
      setShowVisitModal(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error('Não foi possível agendar a visita. Tente novamente.');
    } finally {
      setIsSchedulingVisit(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite || authLoading || isCheckingFavorite}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
            isFavorited
              ? 'bg-yellow-50 border-yellow-200 text-yellow-600'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
          } disabled:opacity-50`}
        >
          {isTogglingFavorite || isCheckingFavorite ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          )}
          {isFavorited ? 'Guardado' : 'Guardar'}
        </button>
        
        <button
          onClick={handleScheduleVisitClick}
          disabled={authLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50"
        >
          <Calendar className="h-5 w-5" />
          Agendar Visita
        </button>
      </div>

      {/* Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Agendar Visita</h3>
            <p className="text-gray-500 text-sm mb-6">
              {propertyTitle}
            </p>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data preferida
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora preferida
                </label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione a hora</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={visitMessage}
                  onChange={(e) => setVisitMessage(e.target.value)}
                  rows={3}
                  placeholder="Alguma informação adicional..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSchedulingVisit}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50"
                >
                  {isSchedulingVisit ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      A agendar...
                    </span>
                  ) : (
                    'Confirmar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
