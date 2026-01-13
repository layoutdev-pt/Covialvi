'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>

          {/* Header */}
          <h1 className="font-display text-2xl font-semibold mb-2">
            Erro de Autenticação
          </h1>
          <p className="text-muted-foreground mb-6">
            Ocorreu um erro durante o processo de autenticação. 
            O link pode ter expirado ou já ter sido utilizado.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button variant="gold" className="w-full">
                Tentar Novamente
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
