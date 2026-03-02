'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FutureProjectDialog } from './future-project-dialog';

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

interface FutureProjectsClientProps {
  initialProjects: FutureProject[];
}

export function FutureProjectsClient({ initialProjects }: FutureProjectsClientProps) {
  const [projects, setProjects] = useState<FutureProject[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<FutureProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (project: FutureProject) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este projeto?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/future-projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao eliminar projeto');
      }

      setProjects(projects.filter(p => p.id !== id));
      toast.success('Projeto eliminado com sucesso!');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao eliminar projeto');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (project: FutureProject) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/future-projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !project.is_published }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar projeto');
      }

      const { project: updatedProject } = await response.json();
      setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
      toast.success(updatedProject.is_published ? 'Projeto publicado!' : 'Projeto despublicado!');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar projeto');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (savedProject: FutureProject) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === savedProject.id ? savedProject : p));
    } else {
      setProjects([savedProject, ...projects]);
    }
    setIsDialogOpen(false);
    setEditingProject(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos Futuros</h1>
          <p className="text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-yellow-500 hover:bg-yellow-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">Nenhum projeto criado ainda</p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className={project.is_published ? 'bg-green-500' : 'bg-gray-500'}>
                    {project.is_published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <Badge className="bg-yellow-500">{project.status}</Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-secondary text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground mb-4">
                  <div>📍 {project.location}</div>
                  <div>📅 {project.start_date}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(project)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {project.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(project)}
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(project.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <FutureProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={editingProject}
        onSave={handleSave}
      />
    </div>
  );
}
