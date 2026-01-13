import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, User, Shield, ShieldCheck, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserRoleForm } from './user-role-form';

export const dynamic = 'force-dynamic';

async function getUsers(): Promise<any[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

const roleLabels: Record<string, string> = {
  user: 'Utilizador',
  admin: 'Administrador',
  super_admin: 'Super Admin',
};

const roleColors: Record<string, string> = {
  user: 'bg-gray-100 text-gray-700',
  admin: 'bg-blue-100 text-blue-700',
  super_admin: 'bg-purple-100 text-purple-700',
};

const roleIcons: Record<string, any> = {
  user: User,
  admin: Shield,
  super_admin: ShieldCheck,
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Utilizadores</h1>
          <p className="text-muted-foreground">
            {users.length} utilizadores registados
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar por nome ou e-mail..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Funções</SelectItem>
            <SelectItem value="user">Utilizador</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Utilizador
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
                Registado
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length > 0 ? (
              users.map((user: any) => {
                const RoleIcon = roleIcons[user.role] || User;
                return (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                          <span className="text-gold-700 font-medium">
                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm flex items-center">
                            <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${roleColors[user.role]} flex items-center w-fit gap-1`}>
                        <RoleIcon className="h-3 w-3" />
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">Inativo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleForm userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Ainda não existem utilizadores registados.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
