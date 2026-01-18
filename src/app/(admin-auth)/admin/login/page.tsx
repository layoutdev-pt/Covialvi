'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Shield, Loader2, AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const supabase = createClient();

  // Check if already logged in as admin
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        console.log('[Admin Login] Checking auth...');
        
        // Refresh session to ensure we have the latest token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Admin Login] Session error:', sessionError);
          if (mounted) setIsCheckingAuth(false);
          return;
        }

        const user = session?.user;
        console.log('[Admin Login] User:', user?.email, 'Session:', !!session);
        
        if (user && session) {
          // First try JWT, then fallback to database lookup
          let role = user.app_metadata?.role || user.user_metadata?.role;
          
          // If no role in JWT, fetch from database
          if (!role || role === 'user') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            
            role = profile?.role || 'user';
          }
          
          const isAdmin = role === 'admin' || role === 'super_admin';
          
          console.log('[Admin Login] Role:', role, 'IsAdmin:', isAdmin);
          
          if (isAdmin) {
            console.log('[Admin Login] Admin detected, redirecting to /admin...');
            // Use window.location.replace to force a full page navigation
            window.location.replace('/admin');
            return;
          } else {
            console.log('[Admin Login] User is not admin, showing login form');
          }
        }
        
        console.log('[Admin Login] No admin session, showing login form');
        if (mounted) setIsCheckingAuth(false);
      } catch (err) {
        console.error('[Admin Login] Error checking auth:', err);
        if (mounted) setIsCheckingAuth(false);
      }
    }
    
    checkAuth();
    
    // Check for error param
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Não tem permissões de administrador. Por favor, inicie sessão com uma conta de administrador.');
    }

    return () => {
      mounted = false;
    };
  }, [router, searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Sign out any existing session first
      await supabase.auth.signOut();
      
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Email ou palavra-passe incorretos.');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Erro ao iniciar sessão.');
        setIsLoading(false);
        return;
      }

      // Check if user is admin - first try JWT, then database
      let role = data.user.app_metadata?.role || data.user.user_metadata?.role;
      
      // If no role in JWT, fetch from database
      if (!role || role === 'user') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        role = profile?.role || 'user';
      }
      
      const isAdmin = role === 'admin' || role === 'super_admin';

      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('Esta conta não tem permissões de administrador.');
        setIsLoading(false);
        return;
      }

      // Success - redirect to admin dashboard
      console.log('[Admin Login] Login successful, redirecting to /admin');
      
      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use window.location.replace to force a full page navigation
      window.location.replace('/admin');
    } catch (err) {
      setError('Ocorreu um erro. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="https://media.egorealestate.com/ORIGINAL/ab9a/2a120afd-2b27-49b5-8934-8237e1cbab9a.png"
              alt="Covialvi"
              width={180}
              height={60}
              className="h-14 w-auto mx-auto brightness-0 invert"
              priority
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/25">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Área Administrativa</h1>
            <p className="text-gray-400 text-sm">
              Acesso restrito a administradores autorizados
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="admin@covialvi.pt"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  A verificar...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Entrar no Painel
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Voltar ao site
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Esta área é monitorizada. Tentativas de acesso não autorizado serão registadas.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
