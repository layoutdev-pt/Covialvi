'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, User, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';

interface UserRoleFormProps {
  userId: string;
  currentRole: string;
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

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(currentRole);
  const router = useRouter();
  const supabase = createClient();
  const { isSuperAdmin } = useAuth();

  const handleRoleChange = async (newRole: string) => {
    if (!isSuperAdmin) {
      toast.error('Apenas Super Admins podem alterar funções de utilizadores.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await (supabase.from('profiles') as any)
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        toast.error('Erro ao atualizar função: ' + error.message);
        setRole(currentRole);
      } else {
        toast.success('Função atualizada com sucesso!');
        setRole(newRole);
        router.refresh();
      }
    } catch (err) {
      toast.error('Erro ao atualizar função.');
      setRole(currentRole);
    } finally {
      setIsLoading(false);
    }
  };

  // If not super admin, show read-only badge
  if (!isSuperAdmin) {
    const RoleIcon = roleIcons[role] || User;
    return (
      <div className="flex items-center justify-end">
        <Badge className={`${roleColors[role]} flex items-center gap-1`}>
          <RoleIcon className="h-3 w-3" />
          {roleLabels[role] || role}
        </Badge>
      </div>
    );
  }

  // Super admin can change roles
  return (
    <div className="flex items-center justify-end">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Utilizador</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
