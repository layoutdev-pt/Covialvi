'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Por favor, introduza um e-mail válido.'),
  password: z.string().min(1, 'A palavra-passe é obrigatória.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if already logged in as admin
  useEffect(() => {
    const checkExistingSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || session.user.app_metadata?.role || 'user';
        if (role === 'admin' || role === 'super_admin') {
          router.replace('/admin');
          return;
        }
      }
      
      setIsCheckingSession(false);
    };

    checkExistingSession();
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        toast.error('E-mail ou palavra-passe incorretos.');
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao iniciar sessão.');
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      const role = profile?.role || authData.user.app_metadata?.role || 'user';
      const isAdmin = role === 'admin' || role === 'super_admin';

      if (!isAdmin) {
        // Sign out non-admin users
        await supabase.auth.signOut();
        toast.error('Acesso restrito a administradores.');
        setIsLoading(false);
        return;
      }

      toast.success('Sessão iniciada com sucesso!');
      
      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
                alt="Covialvi"
                width={180}
                height={60}
                className="h-12 w-auto mx-auto brightness-0 invert"
              />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldCheck className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-white">
                Área de Administração
              </h1>
            </div>
            <p className="text-gray-400">
              Introduza as suas credenciais de administrador
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Endereço de e-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@covialvi.pt"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-700 text-white ${
                  errors.email ? 'border-yellow-500' : 'border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-gray-500`}
              />
              {errors.email && (
                <p className="text-sm text-yellow-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-700 text-white ${
                    errors.password ? 'border-yellow-500' : 'border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10 placeholder:text-gray-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A entrar...
                </span>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-yellow-500 transition-colors"
            >
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
