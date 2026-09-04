'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Mail, ShieldCheck, RefreshCw, X } from 'lucide-react';

interface OtpDialogProps {
  email: string;
  formType: 'contact' | 'property' | 'visit' | 'evaluation';
  isOpen: boolean;
  onVerified: (token: string) => void;
  onClose: () => void;
  onResend: () => Promise<void>;
}

const RESEND_COOLDOWN = 60; // seconds

export function OtpDialog({ email, formType, isOpen, onVerified, onClose, onResend }: OtpDialogProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Start cooldown when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setCooldown(RESEND_COOLDOWN);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    cooldownRef.current = interval;
    return () => clearInterval(interval);
  }, [isOpen]);

  const getCode = useCallback(() => digits.join(''), [digits]);

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    // Handle paste
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      // Auto-submit if all filled
      if (pasted.length === 6) {
        setTimeout(() => verifyCode(pasted), 100);
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit filled
    if (digit && index === 5) {
      const fullCode = [...newDigits].join('');
      if (fullCode.length === 6) {
        setTimeout(() => verifyCode(fullCode), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeOverride?: string) => {
    const code = codeOverride || getCode();
    if (code.length !== 6) {
      setError('Por favor, introduza todos os 6 dígitos.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, formType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Código inválido. Tente novamente.');
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      onVerified(data.verifiedToken);
    } catch {
      setError('Erro de ligação. Por favor, tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    setDigits(['', '', '', '', '', '']);
    try {
      await onResend();
      setCooldown(RESEND_COOLDOWN);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
      cooldownRef.current = interval;
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('Não foi possível reenviar o código. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Verificação do E-mail
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-1">
          Enviámos um código de 6 dígitos para:
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <Mail className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{email}</span>
        </div>

        {/* Spam notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 mb-6">
          <p className="text-xs text-amber-700 dark:text-amber-400 text-center leading-relaxed">
            📁 Não recebeu o e-mail? Verifique a pasta <strong>spam / lixo</strong>. O código é válido por 10 minutos.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-2 justify-center mb-4">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isVerifying}
              className={`
                w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-0
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error
                  ? 'border-red-400 dark:border-red-500'
                  : digit
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700 focus:border-yellow-400'
                }
              `}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-4 animate-in fade-in duration-200">
            {error}
          </p>
        )}

        {/* Verify Button */}
        <button
          onClick={() => verifyCode()}
          disabled={isVerifying || getCode().length < 6}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl h-12 transition-colors shadow-lg shadow-yellow-500/20 mb-4"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              A verificar...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Verificar e Enviar
            </>
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {cooldown > 0
              ? `Reenviar código em ${cooldown}s`
              : 'Reenviar código'}
          </button>
        </div>
      </div>
    </div>
  );
}
