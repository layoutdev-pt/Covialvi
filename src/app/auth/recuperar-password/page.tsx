'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const resetSchema = z.object({
  email: z.string().email('Por favor, introduza um e-mail válido.'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function RecuperarPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/nova-password`,
      });

      if (error) {
        toast.error('Erro ao enviar email. Por favor, tente novamente.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Email enviado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Se existir uma conta com este email, receberá instruções para redefinir a sua palavra-passe.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
                alt="Covialvi"
                width={180}
                height={60}
                className="h-12 w-auto mx-auto dark:brightness-0 dark:invert"
              />
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Recuperar palavra-passe
            </h1>
            <p className="text-muted-foreground">
              Introduza o seu email para receber instruções de recuperação.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Endereço de e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  {...register('email')}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border bg-background text-foreground ${
                    errors.email ? 'border-red-500' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-muted-foreground`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A enviar...
                </span>
              ) : (
                'Enviar instruções'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
