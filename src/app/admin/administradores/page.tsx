import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MoreVertical,
  UserX,
  Key,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AdminRoleForm } from './admin-role-form';

export const dynamic = 'force-dynamic';

async function getCurrentProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
}

async function getAdmins() {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'super_admin'])
    .order('created_at', { ascending: false });

  return data || [];
}

async function getAllUsers() {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'user')
    .order('first_name', { ascending: true });

  return data || [];
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  super_admin: 'Super Admin',
};

const roleColors: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700',
  super_admin: 'bg-purple-100 text-purple-700',
};

export default async function AdminManagementPage() {
  const currentProfile = await getCurrentProfile();
  
  if (!currentProfile || currentProfile.role !== 'super_admin') {
    redirect('/admin');
  }

  const [admins, users] = await Promise.all([getAdmins(), getAllUsers()]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Administradores</h1>
          <p className="text-muted-foreground">
            {admins.length} administradores ativos
          </p>
        </div>
      </div>

      {/* Current Admins */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="font-semibold flex items-center">
            <Shield className="mr-2 h-5 w-5 text-gold-500" />
            Administradores Atuais
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Administrador
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Contacto
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Função
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Desde
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((admin: any) => (
              <tr key={admin.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                      <span className="text-gold-700 font-medium">
                        {admin.first_name?.[0] || admin.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {admin.first_name} {admin.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm flex items-center">
                      <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                      {admin.email}
                    </p>
                    {admin.phone && (
                      <p className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                        {admin.phone}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${roleColors[admin.role]} flex items-center w-fit gap-1`}>
                    {admin.role === 'super_admin' ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                    {roleLabels[admin.role]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {admin.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">Inativo</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(admin.created_at)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {admin.id !== currentProfile.id ? (
                    <AdminRoleForm 
                      userId={admin.id} 
                      currentRole={admin.role}
                      userName={`${admin.first_name} ${admin.last_name}`}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Você</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Promote Users */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="font-semibold flex items-center">
            <User className="mr-2 h-5 w-5 text-gold-500" />
            Promover Utilizadores a Administrador
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um utilizador para conceder permissões de administrador
          </p>
        </div>
        
        {users.length > 0 ? (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar utilizadores..." className="pl-10" />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground text-sm font-medium">
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <AdminRoleForm 
                    userId={user.id} 
                    currentRole="user"
                    userName={`${user.first_name} ${user.last_name}`}
                    isPromotion
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Não existem utilizadores para promover.
            </p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Aviso de Segurança</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Apenas conceda permissões de administrador a pessoas de confiança. 
              Os administradores têm acesso total aos dados do sistema, incluindo 
              informações de clientes e imóveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
