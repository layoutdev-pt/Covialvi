'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { OtpDialog } from '@/components/ui/otp-dialog';

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
  const [visitConsent, setVisitConsent] = useState(false);
  const [visitConsentError, setVisitConsentError] = useState(false);
  const [website, setWebsite] = useState(''); // Honeypot
  const [showOtp, setShowOtp] = useState(false);

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

  /** Step 1: Validate form and send OTP */
  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitDate || !visitTime || !visitorName || !visitorEmail || !visitorPhone) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(visitorEmail)) {
      toast.error('Por favor, introduza um email válido.');
      return;
    }
    if (!visitConsent) {
      setVisitConsentError(true);
      return;
    }
    setVisitConsentError(false);

    setIsSchedulingVisit(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: visitorEmail, formType: 'visit' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar o código de verificação.');
      setShowOtp(true);
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setIsSchedulingVisit(false);
    }
  };

  /** Step 2: OTP verified — do the actual scheduling */
  const handleVisitOtpVerified = async (verifiedToken: string) => {
    setShowOtp(false);
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
          website,
          otpToken: verifiedToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to schedule visit');

      toast.success('Visita agendada com sucesso! Entraremos em contacto para confirmar.');
      setShowVisitModal(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
      setVisitorName('');
      setVisitorEmail('');
      setVisitorPhone('');
      setVisitConsent(false);
      setVisitConsentError(false);
    } catch (error: any) {
      toast.error(error?.message || 'Não foi possível agendar a visita. Tente novamente.');
    } finally {
      setIsSchedulingVisit(false);
    }
  };

  const handleResendVisitOtp = async () => {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: visitorEmail, formType: 'visit' }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao reenviar.');
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <>
      <OtpDialog
        email={visitorEmail}
        formType="visit"
        isOpen={showOtp}
        onVerified={handleVisitOtpVerified}
        onClose={() => setShowOtp(false)}
        onResend={handleResendVisitOtp}
      />

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
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowVisitModal(false); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col max-h-[88vh] sm:max-h-[90vh]">
            {/* Sticky header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Agendar Visita</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 line-clamp-1">{propertyTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVisitModal(false)}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 pb-6">
            <form onSubmit={handleScheduleVisit} className="space-y-4">
              {/* Honeypot field - visually hidden */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website (Não preencher)</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

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

              {/* Consentimento RGPD */}
              <div className={`flex items-start gap-3 p-3 rounded-xl border ${
                visitConsentError ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
              }`}>
                <input
                  type="checkbox"
                  id="visitConsent"
                  checked={visitConsent}
                  onChange={(e) => { setVisitConsent(e.target.checked); setVisitConsentError(false); }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-yellow-500 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="visitConsent" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer">
                  Li e aceito a{' '}
                  <a href="/politica-privacidade" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline font-medium">Política de Privacidade</a>{' '}e os{' '}
                  <a href="/termos-condicoes" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline font-medium">Termos e Condições</a>, e autorizo o armazenamento dos meus dados para agendamento da visita.
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {visitConsentError && (
                <p className="text-xs text-red-500">Deve aceitar os termos para continuar.</p>
              )}

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
        </div>
      )}
    </>
  );
}
