'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduza um e-mail válido.'),
  password: z.string().min(1, 'A palavra-passe é obrigatória.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';
  const isAdmin = searchParams.get('admin') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error('E-mail ou palavra-passe incorretos.');
      } else {
        toast.success('Sessão iniciada com sucesso!');
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push(redirectTo);
        }
        router.refresh();
      }
    } catch {
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 relative z-0">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 relative z-10">
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
              {isAdmin ? 'Acesso Administrador' : 'Entrar na sua conta'}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Introduza as suas credenciais de administrador' : 'Bem-vindo de volta! Introduza os seus dados para aceder.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Endereço de e-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                  errors.email ? 'border-yellow-300 dark:border-yellow-700' : 'border-border'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-muted-foreground`}
              />
              {errors.email && (
                <p className="text-sm text-yellow-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Palavra-passe
                </label>
                <Link
                  href="/auth/recuperar-password"
                  className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                >
                  Esqueceu a palavra-passe?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                    errors.password ? 'border-yellow-300 dark:border-yellow-700' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10 placeholder:text-muted-foreground`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-yellow-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative z-10 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A entrar...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{' '}
            <Link
              href="/auth/registar"
              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
            >
              Registar-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
