'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
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
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [isSchedulingVisit, setIsSchedulingVisit] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');

  // Check if property is already favorited when user is available
  useEffect(() => {
    if (!user) {
      setIsFavorited(false);
      return;
    }
    
    fetch(`/api/favorites?propertyId=${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setIsFavorited(data.favorited === true);
      })
      .catch(() => setIsFavorited(false));
  }, [user, propertyId]);

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

    const wasFavorited = isFavorited;
    setIsFavorited(!wasFavorited); // Optimistic update

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update favorites');
      }

      if (data.favorited) {
        toast.success('Adicionado aos favoritos!');
      } else {
        toast.success('Removido dos favoritos');
      }
      
      setIsFavorited(data.favorited);
    } catch (error: any) {
      console.error('[Favorites] Error:', error);
      setIsFavorited(wasFavorited); // Revert on error
      toast.error(error?.message || 'Erro ao atualizar favoritos');
    }
  };

  const handleScheduleVisitClick = () => {
    setShowVisitModal(true);
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitDate || !visitTime || !visitorName || !visitorEmail || !visitorPhone) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSchedulingVisit(true);
    try {
      const scheduledAt = new Date(`${visitDate}T${visitTime}`).toISOString();
      
      const response = await fetch('/api/visits/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          propertyId, 
          scheduledAt, 
          notes: visitMessage,
          visitorName,
          visitorEmail,
          visitorPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule visit');
      }

      toast.success('Visita agendada com sucesso! Entraremos em contacto para confirmar.', {
        duration: 500,
      });
      setShowVisitModal(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
      setVisitorName('');
      setVisitorEmail('');
      setVisitorPhone('');
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      toast.error(error?.message || 'Não foi possível agendar a visita. Tente novamente.');
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
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
            isFavorited
              ? 'bg-yellow-50 border-yellow-200 text-yellow-600'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          {isFavorited ? 'Guardado' : 'Guardar'}
        </button>
        
        <button
          onClick={handleScheduleVisitClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium hover:shadow-lg hover:shadow-yellow-500/25 transition-all"
        >
          <Calendar className="h-5 w-5" />
          Agendar Visita
        </button>
      </div>

      {/* Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Agendar Visita</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {propertyTitle}
            </p>

            <form onSubmit={handleScheduleVisit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="O seu nome completo"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="O seu email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="O seu número de telefone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data preferida *
                </label>
                <input
                  type="date"
                  min={minDate}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hora preferida
                </label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={visitMessage}
                  onChange={(e) => setVisitMessage(e.target.value)}
                  rows={3}
                  placeholder="Alguma informação adicional..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
