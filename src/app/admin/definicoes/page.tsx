'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Settings,
  Bell,
  Mail,
  Globe,
  Shield,
  Database,
  Palette,
  Save,
  Loader2,
  Calendar,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

interface GoogleAccount {
  email: string;
  name: string;
  picture: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleAccount, setGoogleAccount] = useState<GoogleAccount | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check Google connection status on mount
  useEffect(() => {
    checkGoogleStatus();
    
    // Handle OAuth callback messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'google_connected') {
      toast.success('Google Calendar conectado com sucesso!');
      checkGoogleStatus();
      router.replace('/admin/definicoes');
    } else if (error) {
      const errorMessages: Record<string, string> = {
        google_auth_denied: 'Autorização do Google negada.',
        no_code: 'Código de autorização não recebido.',
        not_configured: 'Google OAuth não está configurado.',
        token_error: 'Erro ao obter tokens do Google.',
        not_authenticated: 'Precisa estar autenticado.',
        db_error: 'Erro ao guardar credenciais.',
        unknown: 'Erro desconhecido.',
      };
      toast.error(errorMessages[error] || 'Erro ao conectar Google Calendar.');
      router.replace('/admin/definicoes');
    }
  }, [searchParams]);

  const checkGoogleStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch('/api/auth/google/status');
      const data = await response.json();
      
      setIsGoogleConnected(data.connected);
      if (data.connected) {
        setGoogleAccount({
          email: data.email,
          name: data.name,
          picture: data.picture,
        });
      } else {
        setGoogleAccount(null);
      }
    } catch (error) {
      console.error('Error checking Google status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Definições guardadas com sucesso!');
    setIsLoading(false);
  };

  const handleGoogleConnect = () => {
    setIsSyncing(true);
    // Redirect to Google OAuth login route
    window.location.href = '/api/auth/google/login';
  };

  const handleGoogleDisconnect = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/auth/google/disconnect', { method: 'POST' });
      
      if (response.ok) {
        setIsGoogleConnected(false);
        setGoogleAccount(null);
        toast.success('Google Calendar desconectado.');
      } else {
        toast.error('Erro ao desconectar Google Calendar.');
      }
    } catch (error) {
      toast.error('Erro ao desconectar Google Calendar.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/calendar/sync', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${data.synced} visitas sincronizadas com Google Calendar!`);
      } else {
        toast.error(data.error || 'Erro ao sincronizar.');
      }
    } catch (error) {
      toast.error('Erro ao sincronizar com Google Calendar.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Definições</h1>
          <p className="text-muted-foreground">
            Configure as opções do sistema
          </p>
        </div>
        <Button variant="gold" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar Alterações
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Geral
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input defaultValue="Covialvi" />
            </div>
            <div className="space-y-2">
              <Label>E-mail de Contacto</Label>
              <Input type="email" defaultValue="info@covialvi.pt" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input type="tel" defaultValue="+351 000 000 000" />
            </div>
            <div className="space-y-2">
              <Label>Morada</Label>
              <Input defaultValue="Lisboa, Portugal" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure as notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novos Contactos</p>
                <p className="text-sm text-muted-foreground">
                  Receber notificação quando um novo contacto é criado
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pedidos de Visita</p>
                <p className="text-sm text-muted-foreground">
                  Receber notificação para novos pedidos de visita
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Sistema</p>
                <p className="text-sm text-muted-foreground">
                  Receber alertas importantes do sistema
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios Semanais</p>
                <p className="text-sm text-muted-foreground">
                  Receber resumo semanal por e-mail
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              E-mail
            </CardTitle>
            <CardDescription>
              Configurações de envio de e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail de Envio</Label>
              <Input type="email" defaultValue="noreply@covialvi.pt" />
            </div>
            <div className="space-y-2">
              <Label>Nome do Remetente</Label>
              <Input defaultValue="Covialvi Imobiliária" />
            </div>
            <div className="space-y-2">
              <Label>Assinatura de E-mail</Label>
              <Input defaultValue="Atenciosamente, Equipa Covialvi" />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Regional
            </CardTitle>
            <CardDescription>
              Configurações regionais e de idioma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select defaultValue="pt-PT">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuso Horário</Label>
              <Select defaultValue="Europe/Lisbon">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Lisbon">Lisboa (GMT+0/+1)</SelectItem>
                  <SelectItem value="Atlantic/Azores">Açores (GMT-1/0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Moeda</Label>
              <Select defaultValue="EUR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="GBP">Libra (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação de Dois Fatores</p>
                <p className="text-sm text-muted-foreground">
                  Exigir 2FA para administradores
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessões Ativas</p>
                <p className="text-sm text-muted-foreground">
                  Terminar sessões após inatividade
                </p>
              </div>
              <Select defaultValue="60">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Registo de Auditoria</p>
                <p className="text-sm text-muted-foreground">
                  Registar todas as ações de administradores
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2 h-5 w-5" />
              Tema
            </CardTitle>
            <CardDescription>
              Escolha o tema de cores da interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {mounted && (
                <>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Sun className={`h-8 w-8 mb-3 ${theme === 'light' ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${theme === 'light' ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      Claro
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Moon className={`h-8 w-8 mb-3 ${theme === 'dark' ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      Escuro
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Monitor className={`h-8 w-8 mb-3 ${theme === 'system' ? 'text-yellow-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${theme === 'system' ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      Sistema
                    </span>
                  </button>
                </>
              )}
              {!mounted && (
                <div className="col-span-3 flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalização visual do painel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cor Principal</Label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-yellow-600" />
                <span className="text-sm text-muted-foreground">Dourado (padrão)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sidebar Compacta</p>
                <p className="text-sm text-muted-foreground">
                  Usar versão compacta da barra lateral
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4 accent-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Google Calendar Integration */}
      <Card className="border-yellow-200 dark:border-yellow-900 bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-950/30 dark:to-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-yellow-600" />
            Integração Google Calendar
          </CardTitle>
          <CardDescription>
            Sincronize as visitas agendadas com o seu Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-4">
              {isCheckingStatus ? (
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : isGoogleConnected && googleAccount ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-200">
                  {googleAccount.picture ? (
                    <img 
                      src={googleAccount.picture} 
                      alt={googleAccount.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                      {googleAccount.name?.charAt(0) || 'G'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              )}
              <div>
                {isGoogleConnected && googleAccount ? (
                  <>
                    <p className="font-medium text-foreground">{googleAccount.name}</p>
                    <p className="text-sm text-muted-foreground">{googleAccount.email}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <Check className="h-3 w-3" />
                      Conectado ao Google Calendar
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Google Calendar</p>
                    <p className="text-sm text-muted-foreground">Não conectado</p>
                  </>
                )}
              </div>
            </div>
            
            {isGoogleConnected ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Sincronizar Agora
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleDisconnect}
                  disabled={isSyncing}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <Button
                variant="gold"
                onClick={handleGoogleConnect}
                disabled={isSyncing || isCheckingStatus}
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Conectar com Google
              </Button>
            )}
          </div>

          {/* Sync Settings */}
          {isGoogleConnected && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="font-medium text-foreground">Opções de Sincronização</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sincronização Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar automaticamente novas visitas
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-yellow-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Incluir Detalhes do Imóvel</p>
                  <p className="text-sm text-muted-foreground">
                    Adicionar referência e morada na descrição do evento
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-yellow-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Incluir Dados do Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    Adicionar nome e contacto do cliente no evento
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-yellow-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Lembretes</p>
                  <p className="text-sm text-muted-foreground">
                    Criar lembretes automáticos antes das visitas
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="1440">1 dia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Calendário de Destino</Label>
                <Select defaultValue="primary">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Calendário Principal</SelectItem>
                    <SelectItem value="work">Trabalho</SelectItem>
                    <SelectItem value="covialvi">Covialvi Visitas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Nota:</strong> A integração com Google Calendar permite sincronizar todas as visitas agendadas 
              automaticamente. Quando uma nova visita é criada ou alterada, o evento correspondente será 
              atualizado no seu calendário.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-yellow-200 dark:border-yellow-900">
        <CardHeader>
          <CardTitle className="text-yellow-600 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis - proceda com cuidado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">Limpar Cache</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Remove todos os dados em cache do sistema
              </p>
            </div>
            <Button variant="outline" className="border-yellow-300 dark:border-yellow-700 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950">
              Limpar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">Exportar Base de Dados</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Criar backup completo de todos os dados
              </p>
            </div>
            <Button variant="outline" className="border-yellow-300 dark:border-yellow-700 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950">
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
