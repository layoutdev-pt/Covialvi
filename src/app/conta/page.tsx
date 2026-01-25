'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Camera, User, Mail, Phone, Lock, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import Link from 'next/link';

const profileSchema = z.object({
  firstName: z.string().min(1, 'O nome é obrigatório.'),
  lastName: z.string().min(1, 'O apelido é obrigatório.'),
  email: z.string().email('Por favor, introduza um e-mail válido.'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Perfil atualizado com sucesso!');
    } catch {
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'favorites', label: 'Favoritos', icon: Heart, href: '/conta/favoritos' },
    { id: 'settings', label: 'Definições', icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie as suas informações pessoais e preferências</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">
                      {profile?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-3">
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Utilizador'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                    Administrador
                  </span>
                )}
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === item.id
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm font-medium">Painel Admin</span>
                  </Link>
                )}

                <hr className="my-3 border-gray-100 dark:border-gray-700" />

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <>
                {/* Personal Info */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informações Pessoais</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                        <input
                          {...register('firstName')}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.firstName ? 'border-yellow-300' : 'border-gray-200 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent`}
                          placeholder="Seu nome"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-yellow-500 mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apelido</label>
                        <input
                          {...register('lastName')}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.lastName ? 'border-yellow-300' : 'border-gray-200 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent`}
                          placeholder="Seu apelido"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-yellow-500 mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">O email não pode ser alterado</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Telefone
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                        placeholder="+351 912 345 678"
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium px-8 py-3 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            A guardar...
                          </>
                        ) : (
                          'Guardar Alterações'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    <Lock className="h-5 w-5 inline mr-2" />
                    Alterar Palavra-passe
                  </h2>
                  <form className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Palavra-passe Atual</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Palavra-passe</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Palavra-passe</label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium px-8 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Alterar Palavra-passe
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* Settings Section */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Definições</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Notificações por Email</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receber atualizações sobre novos imóveis</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Newsletter</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receber newsletter mensal</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="pt-6">
                    <h3 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">Zona de Perigo</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Eliminar permanentemente a sua conta e todos os dados associados.</p>
                    <button className="text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 font-medium px-6 py-2.5 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                      Eliminar Conta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
