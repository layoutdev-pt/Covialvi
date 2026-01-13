'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

const registerSchema = z.object({
  firstName: z.string().min(1, 'O nome é obrigatório.'),
  lastName: z.string().min(1, 'O apelido é obrigatório.'),
  email: z.string().email('Por favor, introduza um e-mail válido.'),
  phone: z.string().optional(),
  password: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Deve aceitar os termos e condições.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As palavras-passe não coincidem.',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este e-mail já está registado.');
        } else if (error.message.includes('not configured')) {
          toast.error('Supabase não está configurado.');
        } else {
          toast.error('Ocorreu um erro. Por favor, tente novamente.');
          console.error('Signup error:', error);
        }
      } else {
        toast.success('Conta criada com sucesso!');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
              Criar conta
            </h1>
            <p className="text-muted-foreground">
              Crie a sua conta para guardar favoritos e agendar visitas.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                  Nome
                </label>
                <input
                  id="firstName"
                  {...register('firstName')}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                    errors.firstName ? 'border-yellow-300 dark:border-yellow-700' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-muted-foreground`}
                />
                {errors.firstName && (
                  <p className="text-sm text-yellow-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                  Apelido
                </label>
                <input
                  id="lastName"
                  {...register('lastName')}
                  className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                    errors.lastName ? 'border-yellow-300 dark:border-yellow-700' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-muted-foreground`}
                />
                {errors.lastName && (
                  <p className="text-sm text-yellow-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Telefone (opcional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+351 900 000 000"
                {...register('phone')}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirmar palavra-passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirme a palavra-passe"
                {...register('confirmPassword')}
                className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                  errors.confirmPassword ? 'border-yellow-300 dark:border-yellow-700' : 'border-border'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-muted-foreground`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-yellow-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                {...register('acceptTerms')}
                className="mt-1 h-4 w-4 rounded border-border text-yellow-600 focus:ring-yellow-500 accent-yellow-500"
              />
              <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
                Li e aceito os{' '}
                <Link href="/termos" className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
                  Termos e Condições
                </Link>{' '}
                e{' '}
                <Link href="/privacidade" className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
                  Política de Privacidade
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-yellow-500">{errors.acceptTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A criar conta...
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link
              href="/auth/login"
              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
