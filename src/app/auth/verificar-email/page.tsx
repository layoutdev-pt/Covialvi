'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-gold-600" />
          </div>

          {/* Header */}
          <h1 className="font-display text-2xl font-semibold mb-2">
            Verifique o seu e-mail
          </h1>
          <p className="text-muted-foreground mb-6">
            Enviámos um link de confirmação para{' '}
            {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              'o seu e-mail'
            )}
            . Por favor, verifique a sua caixa de entrada e clique no link para ativar a sua conta.
          </p>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground">
              <strong>Não recebeu o e-mail?</strong>
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Verifique a pasta de spam ou lixo</li>
              <li>• Certifique-se de que o e-mail está correto</li>
              <li>• Aguarde alguns minutos e tente novamente</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button variant="gold" className="w-full">
                Ir para o Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
