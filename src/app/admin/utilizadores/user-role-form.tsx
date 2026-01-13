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
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserRoleFormProps {
  userId: string;
  currentRole: string;
}

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(currentRole);
  const router = useRouter();
  const supabase = createClient();

  const handleRoleChange = async (newRole: string) => {
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
