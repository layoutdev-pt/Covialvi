'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

const projectSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  full_description: z.string().optional(),
  status: z.string().min(1, 'Estado é obrigatório'),
  location: z.string().min(1, 'Localização é obrigatória'),
  image_url: z.string().url('URL de imagem inválida'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  features: z.string(),
  is_published: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface FutureProject {
  id: string;
  title: string;
  description: string;
  full_description?: string;
  status: string;
  location: string;
  image_url: string;
  features: string[];
  start_date: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface FutureProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: FutureProject | null;
  onSave: (project: FutureProject) => void;
}

export function FutureProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: FutureProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      full_description: '',
      status: 'Planeamento',
      location: '',
      image_url: '',
      start_date: '',
      features: '',
      is_published: false,
    },
  });

  useEffect(() => {
    if (project) {
      setValue('title', project.title);
      setValue('description', project.description);
      setValue('full_description', project.full_description || '');
      setValue('status', project.status);
      setValue('location', project.location);
      setValue('image_url', project.image_url);
      setValue('start_date', project.start_date);
      setValue('features', project.features.join(', '));
      setValue('is_published', project.is_published);
    } else {
      reset();
    }
  }, [project, setValue, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      const featuresArray = data.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const payload = {
        ...data,
        features: featuresArray,
      };

      const url = project
        ? `/api/admin/future-projects/${project.id}`
        : '/api/admin/future-projects';

      const response = await fetch(url, {
        method: project ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao guardar projeto');
      }

      const { project: savedProject } = await response.json();
      toast.success(project ? 'Projeto atualizado!' : 'Projeto criado!');
      onSave(savedProject);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao guardar projeto');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Editar Projeto' : 'Novo Projeto Futuro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ex: Residencial Vila Nova"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição Curta *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição breve do projeto (aparece nos cards)"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="full_description">Descrição Completa</Label>
            <Textarea
              id="full_description"
              {...register('full_description')}
              placeholder="Descrição detalhada do projeto"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Estado *</Label>
              <Input
                id="status"
                {...register('status')}
                placeholder="Ex: Início em 2026, Em Breve"
              />
              {errors.status && (
                <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Localização *</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ex: Covilhã"
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">URL da Imagem *</Label>
            <Input
              id="image_url"
              {...register('image_url')}
              placeholder="https://..."
              type="url"
            />
            {errors.image_url && (
              <p className="text-sm text-destructive mt-1">{errors.image_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="start_date">Data de Início *</Label>
            <Input
              id="start_date"
              {...register('start_date')}
              placeholder="Ex: 2026, 2027"
            />
            {errors.start_date && (
              <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="features">Características (separadas por vírgula)</Label>
            <Input
              id="features"
              {...register('features')}
              placeholder="Ex: 50 Unidades, T2 e T3, Certificação A+"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separe cada característica com vírgula
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              {...register('is_published')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_published" className="cursor-pointer">
              Publicar projeto (visível no site)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>{project ? 'Atualizar' : 'Criar'} Projeto</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
