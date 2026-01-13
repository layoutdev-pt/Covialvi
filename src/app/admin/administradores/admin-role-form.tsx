'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Shield, UserX, UserPlus } from 'lucide-react';

interface AdminRoleFormProps {
  userId: string;
  currentRole: string;
  userName: string;
  isPromotion?: boolean;
}

export function AdminRoleForm({ userId, currentRole, userName, isPromotion }: AdminRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePromote = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`${userName} foi promovido a Administrador`);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao promover utilizador');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemote = async () => {
    if (!confirm(`Tem a certeza que deseja remover as permissões de administrador de ${userName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Permissões de ${userName} foram removidas`);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao remover permissões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Função de ${userName} atualizada`);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar função');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPromotion) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handlePromote}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-1" />
            Promover
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDemote}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            title="Remover permissões"
          >
            <UserX className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
