'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
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
  Save,
  Loader2,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { company } from '@/lib/company';

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Definições guardadas com sucesso!');
    setIsLoading(false);
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
              <Input type="email" defaultValue={company.email} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input type="tel" defaultValue={company.phone} />
            </div>
            <div className="space-y-2">
              <Label>Morada</Label>
              <Input defaultValue={company.address.full} />
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

      </div>

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
