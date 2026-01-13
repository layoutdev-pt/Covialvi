'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PropertyActionsProps {
  propertyId: string;
  propertyTitle: string;
}

export function DeletePropertyButton({ propertyId, propertyTitle }: PropertyActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    try {
      // First delete related property images
      await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);

      // Then delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw error;
      }

      toast.success('Imóvel eliminado com sucesso!');
      router.refresh();
      setShowConfirm(false);
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast.error('Erro ao eliminar o imóvel. Por favor, tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar eliminação</h3>
          <p className="text-gray-600 mb-6">
            Tem a certeza que deseja eliminar o imóvel <strong>"{propertyTitle}"</strong>? Esta ação não pode ser revertida.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A eliminar...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-3 border border-gray-200 rounded-xl hover:bg-yellow-50 hover:border-yellow-200 transition-colors group"
      title="Eliminar imóvel"
    >
      <Trash2 className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600" />
    </button>
  );
}
