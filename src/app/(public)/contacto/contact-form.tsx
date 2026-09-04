'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { OtpDialog } from '@/components/ui/otp-dialog';

const contactSchema = z.object({
  firstName: z.string().min(1, 'O nome é obrigatório.'),
  lastName: z.string().min(1, 'O apelido é obrigatório.'),
  email: z.string().email('Por favor, introduza um e-mail válido.').regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de e-mail inválido.'),
  phone: z.string().min(9, 'O telefone é obrigatório.'),
  subject: z.string().min(1, 'O assunto é obrigatório.'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.'),
  website: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Deve aceitar os termos para continuar.' }) }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [pendingData, setPendingData] = useState<ContactFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  /** Step 1: Validate form, then send OTP */
  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, formType: 'contact' }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Não foi possível enviar o código de verificação.');
      }

      setPendingData(data);
      setShowOtp(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro. Por favor, tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /** Step 2: OTP verified — submit the actual contact form */
  const handleOtpVerified = async (verifiedToken: string) => {
    if (!pendingData) return;
    setShowOtp(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${pendingData.firstName} ${pendingData.lastName}`.trim(),
          email: pendingData.email,
          phone: pendingData.phone,
          subject: pendingData.subject,
          message: pendingData.message,
          source: 'contact',
          website: pendingData.website,
          otpToken: verifiedToken,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || 'Ocorreu um erro. Por favor, tente novamente.');
      }

      setSent(true);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro. Por favor, tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingData) return;
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingData.email, formType: 'contact' }),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result?.error || 'Erro ao reenviar.');
    }
  };

  if (sent) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Mensagem enviada!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          Recebemos o seu contacto e entraremos em contacto consigo brevemente. Verifique também o seu e-mail.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium underline underline-offset-4"
        >
          Enviar nova mensagem
        </button>
      </div>
    );
  }

  const fieldClass = (hasError: boolean) =>
    `flex h-11 w-full rounded-xl border bg-gray-50 dark:bg-gray-800/50 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-colors ${
      hasError
        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-gray-700'
    }`;

  return (
    <>
      <OtpDialog
        email={pendingData?.email || ''}
        formType="contact"
        isOpen={showOtp}
        onVerified={handleOtpVerified}
        onClose={() => setShowOtp(false)}
        onResend={handleResendOtp}
      />

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Envie-nos uma Mensagem
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Todos os campos marcados com <span className="text-yellow-500 font-medium">*</span> são obrigatórios.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Honeypot field - invisible to users */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register('website')}
            />
          </div>

          {/* Nome + Apelido */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome <span className="text-yellow-500">*</span>
              </Label>
              <input
                id="firstName"
                placeholder="João"
                {...register('firstName')}
                className={fieldClass(!!errors.firstName)}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Apelido <span className="text-yellow-500">*</span>
              </Label>
              <input
                id="lastName"
                placeholder="Silva"
                {...register('lastName')}
                className={fieldClass(!!errors.lastName)}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email + Telefone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail <span className="text-yellow-500">*</span>
              </Label>
              <input
                id="email"
                type="email"
                placeholder="joao@exemplo.pt"
                {...register('email')}
                className={fieldClass(!!errors.email)}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Telefone <span className="text-yellow-500">*</span>
              </Label>
              <input
                id="phone"
                type="tel"
                placeholder="+351 9XX XXX XXX"
                {...register('phone')}
                className={fieldClass(!!errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Assunto */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Assunto <span className="text-yellow-500">*</span>
            </Label>
            <input
              id="subject"
              placeholder="Ex: Informações sobre imóvel, Avaliação gratuita..."
              {...register('subject')}
              className={fieldClass(!!errors.subject)}
            />
            {errors.subject && (
              <p className="text-xs text-red-500">{errors.subject.message}</p>
            )}
          </div>

          {/* Mensagem */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mensagem <span className="text-yellow-500">*</span>
            </Label>
            <textarea
              id="message"
              rows={5}
              placeholder="Descreva como podemos ajudá-lo..."
              {...register('message')}
              className={`w-full rounded-xl border bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-colors resize-none ${
                errors.message
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.message && (
              <p className="text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Consentimento RGPD */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${
            errors.consent ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'
          }`}>
            <input
              type="checkbox"
              id="consent"
              {...register('consent')}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-yellow-500 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="consent" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer">
              Concordo que a Covialvi armazene os meus dados pessoais para responder ao meu pedido de contacto, e que li e aceito a{' '}
              <a href="/politica-privacidade" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2 font-medium">Política de Privacidade</a>{' '}e os{' '}
              <a href="/termos-condicoes" target="_blank" className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2 font-medium">Termos e Condições</a>.
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.consent && (
            <p className="text-xs text-red-500 -mt-3">{errors.consent.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl h-12 transition-colors shadow-lg shadow-yellow-500/20 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                A processar...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
