'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAutoSave } from '@/hooks/use-auto-save';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  MapPin,
  Home,
  Euro,
  Ruler,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const propertySchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  reference: z.string().min(1, 'A referência é obrigatória'),
  description: z.string().optional(),
  business_type: z.enum(['sale', 'rent', 'transfer']),
  nature: z.enum(['apartment', 'house', 'land', 'commercial', 'warehouse', 'office', 'garage', 'shop']),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  price: z.string().optional(),
  price_on_request: z.boolean().default(false),
  district: z.string().optional(),
  municipality: z.string().optional(),
  parish: z.string().optional(),
  address: z.string().optional(),
  gross_area: z.string().optional(),
  useful_area: z.string().optional(),
  land_area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  floors: z.string().optional(),
  typology: z.string().optional(),
  construction_status: z.string().optional(),
  construction_year: z.string().optional(),
  energy_certificate: z.string().optional(),
  video_url: z.string().optional(),
  virtual_tour_url: z.string().optional(),
});

const constructionStatusLabels: Record<string, string> = {
  new: 'Novo',
  used: 'Usado',
  under_construction: 'Em Construção',
  renovated: 'Renovado',
  to_renovate: 'Para Renovar',
};

const energyCertificateOptions = [
  'A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'Isento',
];

type PropertyFormData = z.infer<typeof propertySchema>;

const businessTypeLabels: Record<string, string> = {
  sale: 'Venda',
  rent: 'Arrendamento',
  transfer: 'Trespasse',
};

const natureLabels: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Moradia',
  land: 'Terreno',
  commercial: 'Comercial',
  warehouse: 'Armazém',
  office: 'Escritório',
  garage: 'Garagem',
  shop: 'Loja',
};

const propertyStatusLabels: Record<string, string> = {
  usado: 'Usado',
  vendido: 'Vendido',
  renovado: 'Renovado',
  recuperado: 'Recuperado',
  por_recuperar: 'Por Recuperar',
  novo: 'Novo',
  em_projeto: 'Em Projeto',
  em_construcao: 'Em Construção',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

interface PropertyImage {
  id: string;
  url: string;
  is_cover: boolean;
  order: number;
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Auto-save hook
  const {
    status: autoSaveStatus,
    lastSaved,
    error: autoSaveError,
    saveField,
    saveFields,
    forceSave,
  } = useAutoSave({
    table: 'properties',
    id: params.id,
    debounceMs: 800,
    onSaveSuccess: () => {
      // Silent success - indicator shows feedback
    },
    onSaveError: (error) => {
      // Ignore AbortError (happens on navigation/unmount)
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        return;
      }
      toast.error(`Erro ao guardar: ${error.message}`);
    },
  });
  
  // Images state
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  
  // Floor plan state
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [isUploadingFloorPlan, setIsUploadingFloorPlan] = useState(false);
  
  // Brochure state
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);
  
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  
  // Auto-save wrapper for text inputs (onBlur)
  const handleFieldBlur = useCallback((field: string, value: any) => {
    if (value !== undefined && value !== null) {
      // Convert numeric strings to numbers for numeric fields
      const numericFields = ['price', 'gross_area', 'useful_area', 'land_area', 'bedrooms', 'bathrooms', 'floors', 'construction_year'];
      if (numericFields.includes(field) && value !== '') {
        saveField(field, parseFloat(value) || null);
      } else {
        saveField(field, value || null);
      }
    }
  }, [saveField]);

  // Auto-save wrapper for select/toggle changes (immediate)
  const handleSelectChange = useCallback((field: string, value: any) => {
    setValue(field as any, value);
    saveField(field, value);
  }, [setValue, saveField]);

  // Auto-save for array fields (zona envolvente, equipamentos, extras)
  const handleArrayFieldChange = useCallback((field: string, values: string[]) => {
    saveField(field, values);
  }, [saveField]);

  // Load property data
  useEffect(() => {
    let isMounted = true;
    
    async function loadProperty() {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        const property = await response.json();

        if (!isMounted) return;

        if (!response.ok || !property || property.error) {
          toast.error(property.error || 'Imóvel não encontrado');
          router.push('/admin/imoveis');
          return;
        }

        // Set form values
        reset({
          title: property.title || '',
          reference: property.reference || '',
          description: property.description || '',
          business_type: property.business_type || 'sale',
          nature: property.nature || 'apartment',
          status: property.status || 'draft',
          price: property.price?.toString() || '',
          price_on_request: property.price_on_request || false,
          district: property.district || '',
          municipality: property.municipality || '',
          parish: property.parish || '',
          address: property.address || '',
          gross_area: property.gross_area?.toString() || '',
          useful_area: property.useful_area?.toString() || '',
          land_area: property.land_area?.toString() || '',
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          floors: property.floors?.toString() || '',
          typology: property.typology || '',
          construction_status: property.construction_status || '',
          construction_year: property.construction_year?.toString() || '',
          energy_certificate: property.energy_certificate || '',
          video_url: property.video_url || '',
          virtual_tour_url: property.virtual_tour_url || '',
        });

        // Set existing images
        if (property.property_images) {
          setExistingImages(property.property_images);
          const cover = property.property_images.find((img: PropertyImage) => img.is_cover);
          if (cover) setCoverImageId(cover.id);
        }
        
        // Load floor plan URL
        if (property.property_floor_plans?.length > 0) {
          setFloorPlanUrl(property.property_floor_plans[0].url);
        }
        
        // Load brochure URL
        if (property.brochure_url) {
          setBrochureUrl(property.brochure_url);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading property:', err);
        if (isMounted) {
          toast.error('Erro ao carregar imóvel');
          setIsLoading(false);
        }
      }
    }

    loadProperty();
    
    return () => {
      isMounted = false;
    };
  }, [params.id]);

  // Image handlers
  const setCoverImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/properties/${params.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, is_cover: true }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao atualizar');
      }

      setCoverImageId(imageId);
      setExistingImages(prev => prev.map(img => ({
        ...img,
        is_cover: img.id === imageId
      })));
      toast.success('Imagem de capa atualizada');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar imagem de capa');
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/properties/${params.id}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao remover');
      }

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      if (coverImageId === imageId) {
        setCoverImageId(null);
      }
      toast.success('Imagem removida');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover imagem');
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isFirstImage = existingImages.length === 0 && i === 0;
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('is_cover', isFirstImage ? 'true' : 'false');
        formData.append('order', (existingImages.length + i).toString());

        const response = await fetch(`/api/properties/${params.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao carregar');

        setExistingImages(prev => [...prev, data]);
        if (isFirstImage) {
          setCoverImageId(data.id);
        }
      } catch (err: any) {
        console.error('Error uploading image:', err);
        toast.error(`Erro ao carregar ${file.name}: ${err.message}`);
      }
    }

    setIsUploading(false);
    toast.success('Imagens carregadas com sucesso');
    
    // Reset file input
    e.target.value = '';
  };

  // Floor plan upload handler
  const handleFloorPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFloorPlan(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'floor_plan');

      const response = await fetch(`/api/properties/${params.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao carregar');

      setFloorPlanUrl(data.url);
      toast.success('Planta carregada com sucesso');
    } catch (err: any) {
      console.error('Error uploading floor plan:', err);
      toast.error(err.message || 'Erro ao carregar planta');
    } finally {
      setIsUploadingFloorPlan(false);
      e.target.value = '';
    }
  };

  // Brochure upload handler
  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBrochure(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'brochure');

      const response = await fetch(`/api/properties/${params.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao carregar');

      setBrochureUrl(data.url);
      toast.success('Brochura carregada com sucesso');
    } catch (err: any) {
      console.error('Error uploading brochure:', err);
      toast.error(err.message || 'Erro ao carregar brochura');
    } finally {
      setIsUploadingBrochure(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSaving(true);
    try {
      const updateData = {
        title: data.title,
        reference: data.reference,
        description: data.description || null,
        business_type: data.business_type,
        nature: data.nature,
        status: data.status,
        price: data.price ? parseFloat(data.price) : null,
        price_on_request: data.price_on_request,
        district: data.district || null,
        municipality: data.municipality || null,
        parish: data.parish || null,
        address: data.address || null,
        gross_area: data.gross_area ? parseFloat(data.gross_area) : null,
        useful_area: data.useful_area ? parseFloat(data.useful_area) : null,
        land_area: data.land_area ? parseFloat(data.land_area) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        floors: data.floors ? parseInt(data.floors) : null,
        typology: data.typology || null,
        construction_status: data.construction_status || null,
        construction_year: data.construction_year ? parseInt(data.construction_year) : null,
        energy_certificate: data.energy_certificate || null,
        video_url: data.video_url || null,
        virtual_tour_url: data.virtual_tour_url || null,
      };

      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao atualizar');

      toast.success('Imóvel atualizado com sucesso!');
      router.push('/admin/imoveis');
    } catch (err: any) {
      console.error('Error updating property:', err);
      toast.error(err.message || 'Erro ao atualizar imóvel');
    } finally {
      setIsSaving(false);
    }
  };

  const publishProperty = async () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/imoveis">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editar Imóvel</h1>
            <p className="text-muted-foreground">Atualize os dados do imóvel</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <AutoSaveIndicator 
            status={autoSaveStatus} 
            lastSaved={lastSaved} 
            error={autoSaveError} 
          />
          <Button variant="outline" onClick={() => router.push('/admin/imoveis')}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar
          </Button>
          <Button variant="gold" onClick={publishProperty} disabled={isSaving}>
            <Eye className="mr-2 h-4 w-4" />
            Publicar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Informação Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Ex: Apartamento T3 em Lisboa"
                    className={errors.title ? 'border-destructive' : ''}
                    onBlur={(e) => handleFieldBlur('title', e.target.value)}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referência *</Label>
                  <Input
                    id="reference"
                    {...register('reference')}
                    placeholder="Ex: COV-001"
                    className={errors.reference ? 'border-destructive' : ''}
                    onBlur={(e) => handleFieldBlur('reference', e.target.value)}
                  />
                  {errors.reference && (
                    <p className="text-sm text-destructive">{errors.reference.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Tipo de Negócio *</Label>
                  <Select
                    value={watch('business_type')}
                    onValueChange={(value) => handleSelectChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(businessTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Natureza *</Label>
                  <Select
                    value={watch('nature')}
                    onValueChange={(value) => handleSelectChange('nature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(natureLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipologia</Label>
                  <Input
                    {...register('typology')}
                    placeholder="Ex: T3"
                    onBlur={(e) => handleFieldBlur('typology', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estado do Imóvel</Label>
                  <Select
                    value={watch('construction_status') || ''}
                    onValueChange={(value) => handleSelectChange('construction_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(constructionStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  placeholder="Descreva o imóvel em detalhe..."
                  onBlur={(e) => handleFieldBlur('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Distrito</Label>
                  <Input {...register('district')} placeholder="Ex: Castelo Branco" onBlur={(e) => handleFieldBlur('district', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Concelho</Label>
                  <Input {...register('municipality')} placeholder="Ex: Covilhã" onBlur={(e) => handleFieldBlur('municipality', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Freguesia</Label>
                  <Input {...register('parish')} placeholder="Ex: Covilhã e Canhoso" onBlur={(e) => handleFieldBlur('parish', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Morada</Label>
                <Input {...register('address')} placeholder="Rua, número, andar..." onBlur={(e) => handleFieldBlur('address', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Areas & Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ruler className="mr-2 h-5 w-5" />
                Áreas e Características
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Área Bruta (m²)</Label>
                  <Input {...register('gross_area')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('gross_area', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Área Útil (m²)</Label>
                  <Input {...register('useful_area')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('useful_area', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Quartos</Label>
                  <Input {...register('bedrooms')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('bedrooms', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Casas de Banho</Label>
                  <Input {...register('bathrooms')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('bathrooms', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Input {...register('floors')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('floors', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ano Construção</Label>
                  <Input {...register('construction_year')} type="number" placeholder="2024" onBlur={(e) => handleFieldBlur('construction_year', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estado de Construção</Label>
                  <Select
                    value={watch('construction_status') || ''}
                    onValueChange={(value) => handleSelectChange('construction_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(constructionStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Certificado Energético</Label>
                  <Select
                    value={watch('energy_certificate') || ''}
                    onValueChange={(value) => handleSelectChange('energy_certificate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {energyCertificateOptions.map((cert) => (
                        <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Fotografias do Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 mx-auto text-yellow-500 mb-3 animate-spin" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        A carregar imagens...
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Clique para carregar imagens
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WebP (máx. 10MB cada)
                      </p>
                    </>
                  )}
                </label>
              </div>

              {existingImages.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {existingImages.map((image) => (
                      <div 
                        key={image.id} 
                        className={`relative group aspect-square rounded-lg overflow-hidden bg-secondary ${image.id === coverImageId ? 'ring-2 ring-yellow-500' : ''}`}
                      >
                        <img
                          src={image.url}
                          alt="Property"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setCoverImage(image.id)}
                            className="text-white hover:text-white hover:bg-yellow-500"
                            title="Definir como capa"
                          >
                            <Home className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteImage(image.id)}
                            className="text-white hover:text-white hover:bg-red-500"
                            title="Remover"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        {image.id === coverImageId && (
                          <span className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clique no ícone da casa para definir a imagem de capa. Clique no ícone do lixo para remover.
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  Nenhuma imagem adicionada. Use o botão acima para carregar fotografias.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Floor Plan Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Planta do Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFloorPlanUpload}
                  className="hidden"
                  id="floorplan-upload"
                  disabled={isUploadingFloorPlan}
                />
                <label htmlFor="floorplan-upload" className="cursor-pointer">
                  {isUploadingFloorPlan ? (
                    <Loader2 className="h-6 w-6 mx-auto text-yellow-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Clique para carregar PDF ou imagem</p>
                    </>
                  )}
                </label>
              </div>
              {floorPlanUrl && (
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Planta carregada</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFloorPlanUrl(null)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brochure Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Brochura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleBrochureUpload}
                  className="hidden"
                  id="brochure-upload"
                  disabled={isUploadingBrochure}
                />
                <label htmlFor="brochure-upload" className="cursor-pointer">
                  {isUploadingBrochure ? (
                    <Loader2 className="h-6 w-6 mx-auto text-yellow-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Clique para carregar PDF</p>
                    </>
                  )}
                </label>
              </div>
              {brochureUrl && (
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Brochura carregada</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBrochureUrl(null)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Vídeo (YouTube)</Label>
                <Input
                  {...register('video_url')}
                  placeholder="https://youtube.com/watch?v=..."
                  onBlur={(e) => handleFieldBlur('video_url', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Euro className="mr-2 h-5 w-5" />
                Preço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preço (€)</Label>
                <Input
                  {...register('price')}
                  type="number"
                  placeholder="0"
                  disabled={watch('price_on_request')}
                  onBlur={(e) => handleFieldBlur('price', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="price_on_request"
                  {...register('price_on_request')}
                  className="h-4 w-4 rounded border-gray-300"
                  onChange={(e) => {
                    setValue('price_on_request', e.target.checked);
                    saveField('price_on_request', e.target.checked);
                  }}
                />
                <Label htmlFor="price_on_request" className="text-sm font-normal">
                  Preço sob consulta
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Publicação</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={watch('status')}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Apenas imóveis publicados são visíveis no site.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
