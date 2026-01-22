'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Upload,
  X,
  Loader2,
  MapPin,
  Home,
  Euro,
  Ruler,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';

const propertySchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  reference: z.string().min(1, 'A referência é obrigatória'),
  description: z.string().optional(),
  business_type: z.enum(['sale', 'rent', 'transfer']),
  nature: z.enum(['apartment', 'house', 'land', 'commercial', 'warehouse', 'office', 'garage', 'shop']),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  price: z.string().optional(),
  price_on_request: z.boolean().default(false),
  district: z.string().optional(),
  municipality: z.string().optional(),
  parish: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
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

const constructionStatusLabels: Record<string, string> = {
  new: 'Novo',
  used: 'Usado',
  under_construction: 'Em Construção',
  in_project: 'Em Projecto',
  to_recover: 'Para Recuperar',
  recovered: 'Recuperado',
  renovated: 'Renovado',
  sold: 'Vendido',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
  sold: 'Vendido',
  reserved: 'Reservado',
};

const propertyStatusLabels: Record<string, string> = {
  used: 'Usado',
  sold: 'Vendido',
  renovated: 'Renovado',
  recovered: 'Recuperado',
  to_recover: 'Para Recuperar',
  new: 'Novo',
  in_project: 'Em Projeto',
  under_construction: 'Em Construção',
};

// Add these to the schema
const propertyConditionStatus = ['used', 'sold', 'renovated', 'recovered', 'to_recover', 'new', 'in_project', 'under_construction'] as const;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const DRAFT_STORAGE_KEY = 'property_draft_id';

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewPropertyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [brochure, setBrochure] = useState<File | null>(null);
  const [floorPlans, setFloorPlans] = useState<File[]>([]);
  const [floorPlansPreviews, setFloorPlansPreviews] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [surroundingArea, setSurroundingArea] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<{name: string; area: string}[]>([]);
  const [uploadedImages, setUploadedImages] = useState<{id: string; url: string; order: number}[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      status: 'published',
      business_type: 'sale',
      nature: 'apartment',
      price_on_request: false,
      construction_status: '',
      energy_certificate: '',
      typology: '',
      district: '',
      municipality: '',
      parish: '',
    },
  });

  // Auto-save hook
  const {
    status: autoSaveStatus,
    lastSaved,
    error: autoSaveError,
    saveField,
    saveFields,
    forceSave,
    isSaving,
  } = useAutoSave({
    table: 'properties',
    id: draftId,
    debounceMs: 800,
    onSaveError: (err) => {
      console.error('Auto-save error:', err);
    },
  });

  // Create or restore draft on mount
  useEffect(() => {
    const initializeDraft = async () => {
      setIsInitializing(true);
      
      // Check for existing draft in localStorage
      const existingDraftId = localStorage.getItem(DRAFT_STORAGE_KEY);
      
      if (existingDraftId) {
        // Try to load existing draft
        const { data: existingDraft, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', existingDraftId)
          .eq('status', 'draft')
          .single();
        
        if (existingDraft && !error) {
          // Restore draft data to form
          setDraftId(existingDraftId);
          reset({
            title: existingDraft.title || '',
            reference: existingDraft.reference || '',
            description: existingDraft.description || '',
            business_type: existingDraft.business_type || 'sale',
            nature: existingDraft.nature || 'apartment',
            status: existingDraft.status || 'draft',
            price: existingDraft.price?.toString() || '',
            price_on_request: existingDraft.price_on_request || false,
            district: existingDraft.district || '',
            municipality: existingDraft.municipality || '',
            parish: existingDraft.parish || '',
            address: existingDraft.address || '',
            postal_code: existingDraft.postal_code || '',
            gross_area: existingDraft.gross_area?.toString() || '',
            useful_area: existingDraft.useful_area?.toString() || '',
            land_area: existingDraft.land_area?.toString() || '',
            bedrooms: existingDraft.bedrooms?.toString() || '',
            bathrooms: existingDraft.bathrooms?.toString() || '',
            floors: existingDraft.floors?.toString() || '',
            typology: existingDraft.typology || '',
            construction_status: existingDraft.construction_status || '',
            construction_year: existingDraft.construction_year?.toString() || '',
            energy_certificate: existingDraft.energy_certificate || '',
          });
          
          // Load existing images
          const { data: existingImages } = await supabase
            .from('property_images')
            .select('id, url, order')
            .eq('property_id', existingDraftId)
            .order('order');
          
          if (existingImages) {
            setImagesPreviews(existingImages.map((img: { url: string }) => img.url));
          }
          
          setIsInitializing(false);
          return;
        } else {
          // Draft no longer exists, clear localStorage
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
      
      // Create new property (always published)
      const tempSlug = `novo-imovel-${Date.now()}`;
      const { data: newDraft, error: createError } = await supabase
        .from('properties')
        .insert({
          title: '',
          reference: `REF-${Date.now()}`,
          slug: tempSlug,
          status: 'published',
          business_type: 'sale',
          nature: 'apartment',
        })
        .select()
        .single();
      
      if (newDraft && !createError) {
        setDraftId(newDraft.id);
        localStorage.setItem(DRAFT_STORAGE_KEY, newDraft.id);
        setValue('reference', newDraft.reference);
      } else {
        console.error('Error creating draft:', createError);
        toast.error('Erro ao inicializar rascunho');
      }
      
      setIsInitializing(false);
    };
    
    initializeDraft();
  }, [supabase, reset, setValue]);

  // Auto-save wrapper functions
  const handleFieldBlur = useCallback((field: string, value: any) => {
    if (value !== undefined && value !== '') {
      saveField(field, value);
    }
  }, [saveField]);

  const handleSelectChange = useCallback((field: string, value: any) => {
    setValue(field as any, value);
    saveField(field, value);
  }, [setValue, saveField]);

  const handleCheckboxChange = useCallback((field: string, checked: boolean) => {
    setValue(field as any, checked);
    saveField(field, checked);
  }, [setValue, saveField]);

  // Immediate image upload to Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!draftId) {
      toast.error('Aguarde a inicialização do rascunho');
      return;
    }
    
    const files = Array.from(e.target.files || []);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${draftId}/${Date.now()}-${i}.${fileExt}`;
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
      
      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);
        
        const currentOrder = uploadedImages.length + i;
        const isFirstImage = uploadedImages.length === 0 && i === 0;
        const { data: imageRecord, error: insertError } = await supabase
          .from('property_images')
          .insert({
            property_id: draftId,
            url: publicUrl,
            order: currentOrder,
            is_cover: isFirstImage, // First image uploaded is cover by default, user can change
          })
          .select()
          .single();
        
        if (imageRecord && !insertError) {
          setUploadedImages((prev) => [...prev, { id: imageRecord.id, url: publicUrl, order: currentOrder }]);
        }
      } else {
        console.error('Error uploading image:', uploadError);
        toast.error('Erro ao carregar imagem');
      }
    }
    
    e.target.value = '';
  };

  const removeImage = async (index: number) => {
    const imageToRemove = uploadedImages[index];
    
    if (imageToRemove) {
      // Delete from database
      await supabase
        .from('property_images')
        .delete()
        .eq('id', imageToRemove.id);
    }
    
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    
    // Adjust cover index if needed
    if (index === coverImageIndex) {
      setCoverImageIndex(0);
    } else if (index < coverImageIndex) {
      setCoverImageIndex((prev) => prev - 1);
    }
  };

  const setCoverImage = async (index: number) => {
    setCoverImageIndex(index);
    
    // Update is_cover in database for all images
    if (uploadedImages.length > 0) {
      // Set all images to not cover
      for (let i = 0; i < uploadedImages.length; i++) {
        await supabase
          .from('property_images')
          .update({ is_cover: i === index })
          .eq('id', uploadedImages[i].id);
      }
    }
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrochure(file);
    }
  };

  const handleFloorPlansUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFloorPlans((prev) => [...prev, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFloorPlansPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFloorPlan = (index: number) => {
    setFloorPlans((prev) => prev.filter((_, i) => i !== index));
    setFloorPlansPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!draftId) {
      toast.error('Rascunho não inicializado');
      return;
    }
    
    setIsLoading(true);
    try {
      // Force save any pending changes
      await forceSave();
      
      // Generate slug from title
      const slug = generateSlugFromTitle(data.title);
      
      // Get current form values to ensure we have the latest
      const currentConstructionStatus = data.construction_status;
      const currentNature = data.nature;
      const currentBusinessType = data.business_type;
      const currentEnergyCertificate = data.energy_certificate;
      
      console.log('Form data on submit:', {
        construction_status: currentConstructionStatus,
        nature: currentNature,
        business_type: currentBusinessType,
        energy_certificate: currentEnergyCertificate,
      });
      
      // Complete property data with all fields
      const propertyData = {
        title: data.title,
        reference: data.reference,
        description: data.description || null,
        business_type: currentBusinessType,
        nature: currentNature,
        status: data.status,
        slug,
        price: data.price ? parseFloat(data.price) : null,
        price_on_request: data.price_on_request,
        district: data.district || '',
        municipality: data.municipality || '',
        parish: data.parish || '',
        address: data.address || '',
        postal_code: data.postal_code || '',
        gross_area: data.gross_area ? parseFloat(data.gross_area) : null,
        useful_area: data.useful_area ? parseFloat(data.useful_area) : null,
        land_area: data.land_area ? parseFloat(data.land_area) : null,
        bedrooms: data.bedrooms !== undefined && data.bedrooms !== '' ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms !== undefined && data.bathrooms !== '' ? parseInt(data.bathrooms) : null,
        floors: data.floors !== undefined && data.floors !== '' ? parseInt(data.floors) : null,
        typology: data.typology || '',
        construction_status: currentConstructionStatus || null,
        construction_year: data.construction_year ? parseInt(data.construction_year) : null,
        energy_certificate: currentEnergyCertificate || '',
        video_url: data.video_url || '',
        virtual_tour_url: data.virtual_tour_url || '',
        equipment: equipment.length > 0 ? equipment : [],
        extras: extras.length > 0 ? extras : [],
        surrounding_area: surroundingArea.length > 0 ? surroundingArea : [],
        divisions: divisions.filter(d => d.name && d.area).reduce((acc, d) => {
          acc[d.name] = parseFloat(d.area);
          return acc;
        }, {} as Record<string, number>),
      };

      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', draftId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Clear draft from localStorage
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Upload all files in parallel for better performance
      const uploadPromises: Promise<void>[] = [];

      // Upload images in parallel
      if (images.length > 0 && draftId) {
        const imagePromises = images.map(async (file, i) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${draftId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName);

            await supabase.from('property_images').insert({
              property_id: draftId,
              url: publicUrl,
              order: i,
              is_cover: i === coverImageIndex,
            });
          }
        });
        uploadPromises.push(...imagePromises);
      }

      // Upload brochure
      if (brochure && draftId) {
        const brochurePromise = (async () => {
          const fileExt = brochure.name.split('.').pop();
          const fileName = `${draftId}/brochure-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('property-documents')
            .upload(fileName, brochure);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('property-documents')
              .getPublicUrl(fileName);

            await supabase
              .from('properties')
              .update({ brochure_url: publicUrl })
              .eq('id', draftId);
          }
        })();
        uploadPromises.push(brochurePromise);
      }

      // Upload floor plans in parallel
      if (floorPlans.length > 0 && draftId) {
        const floorPlanPromises = floorPlans.map(async (file, i) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${draftId}/floorplan-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('property-documents')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('property-documents')
              .getPublicUrl(fileName);

            await supabase.from('property_floor_plans').insert({
              property_id: draftId,
              url: publicUrl,
              title: file.name,
              order: i,
            });
          }
        });
        uploadPromises.push(...floorPlanPromises);
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      toast.success('Imóvel criado com sucesso!');
      router.push('/admin/imoveis');
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast.error(error.message || 'Erro ao guardar imóvel');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start new draft (discard current)
  const handleNewDraft = async () => {
    if (draftId) {
      // Delete current draft
      await supabase.from('properties').delete().eq('id', draftId);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    // Reload page to create new draft
    window.location.reload();
  };

  const handlePreview = () => {
    const formData = watch();
    // Open preview in new tab with property data
    const previewData = {
      title: formData.title,
      reference: formData.reference,
      description: formData.description,
      business_type: formData.business_type,
      nature: formData.nature,
      price: formData.price,
      price_on_request: formData.price_on_request,
      district: formData.district,
      municipality: formData.municipality,
      address: formData.address,
      gross_area: formData.gross_area,
      useful_area: formData.useful_area,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      typology: formData.typology,
      construction_status: formData.construction_status,
    };
    
    // Store in sessionStorage for preview page
    sessionStorage.setItem('propertyPreview', JSON.stringify(previewData));
    window.open('/admin/imoveis/preview', '_blank');
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-500" />
          <p className="text-muted-foreground">A inicializar rascunho...</p>
        </div>
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
            <h1 className="text-2xl font-bold text-foreground">Novo Imóvel</h1>
            <p className="text-muted-foreground">Preencha os dados do imóvel - guardado automaticamente</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} error={autoSaveError} />
          <Button variant="outline" onClick={handlePreview} disabled={isLoading || isInitializing}>
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Button>
          <Button variant="gold" onClick={handleSubmit(onSubmit)} disabled={isLoading || isInitializing || isSaving}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
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

              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipologia</Label>
                  <Input
                    {...register('typology')}
                    placeholder="Ex: T3"
                    onBlur={(e) => handleFieldBlur('typology', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descreva o imóvel em detalhe..."
                  rows={6}
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
                  <Input {...register('district')} placeholder="Ex: Lisboa" onBlur={(e) => handleFieldBlur('district', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Concelho</Label>
                  <Input {...register('municipality')} placeholder="Ex: Lisboa" onBlur={(e) => handleFieldBlur('municipality', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Freguesia</Label>
                  <Input {...register('parish')} placeholder="Ex: Avenidas Novas" onBlur={(e) => handleFieldBlur('parish', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Morada</Label>
                  <Input {...register('address')} placeholder="Rua, número, andar..." onBlur={(e) => handleFieldBlur('address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input {...register('postal_code')} placeholder="0000-000" onBlur={(e) => handleFieldBlur('postal_code', e.target.value)} />
                </div>
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Área Bruta (m²)</Label>
                  <Input {...register('gross_area')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('gross_area', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Área Útil (m²)</Label>
                  <Input {...register('useful_area')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('useful_area', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Área Terreno (m²)</Label>
                  <Input {...register('land_area')} type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Quartos</Label>
                  <Input {...register('bedrooms')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('bedrooms', e.target.value !== '' ? parseInt(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Casas de Banho</Label>
                  <Input {...register('bathrooms')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('bathrooms', e.target.value !== '' ? parseInt(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Input {...register('floors')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('floors', e.target.value !== '' ? parseInt(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Ano Construção</Label>
                  <Input {...register('construction_year')} type="number" placeholder="2024" onBlur={(e) => handleFieldBlur('construction_year', e.target.value ? parseInt(e.target.value) : null)} />
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
                      {['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'Isento'].map((cert) => (
                        <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Imagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Clique para carregar ou arraste imagens
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG até 10MB
                    </p>
                  </label>
                </div>

                {imagesPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {imagesPreviews.map((preview, index) => (
                      <div 
                        key={index} 
                        className={`relative group cursor-pointer ${index === coverImageIndex ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => setCoverImage(index)}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                          className="absolute top-1 right-1 p-1 bg-yellow-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === coverImageIndex && (
                          <span className="absolute bottom-1 left-1 text-xs bg-gold-500 text-white px-2 py-0.5 rounded">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {imagesPreviews.length > 1 && (
                  <p className="text-xs text-muted-foreground">Clique numa imagem para a definir como capa</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brochure */}
              <div className="space-y-2">
                <Label>Brochura (PDF)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleBrochureUpload}
                    className="hidden"
                    id="brochure-upload"
                  />
                  <label htmlFor="brochure-upload" className="cursor-pointer">
                    {brochure ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-foreground">{brochure.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setBrochure(null); }}
                          className="p-1 bg-yellow-500 text-white rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Carregar brochura</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Floor Plans */}
              <div className="space-y-2">
                <Label>Plantas</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleFloorPlansUpload}
                    className="hidden"
                    id="floorplans-upload"
                  />
                  <label htmlFor="floorplans-upload" className="cursor-pointer">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Carregar plantas</p>
                  </label>
                </div>
                {floorPlansPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {floorPlansPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Planta ${index + 1}`}
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFloorPlan(index)}
                          className="absolute top-1 right-1 p-1 bg-yellow-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video & Virtual Tour */}
          <Card>
            <CardHeader>
              <CardTitle>Vídeo e Tour Virtual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Link do Vídeo (YouTube, Vimeo)</Label>
                <Input {...register('video_url')} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="space-y-2">
                <Label>Link do Tour Virtual 360º</Label>
                <Input {...register('virtual_tour_url')} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          {/* Zona Envolvente */}
          <Card>
            <CardHeader>
              <CardTitle>Zona Envolvente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {['Ampla Oferta de Serviços', 'Biblioteca', 'Centro Comercial', 'Condomínio Fechado', 'Escola', 'Espaços Verdes', 'Estação Ferroviária', 'Estação Rodoviária', 'Excelentes Acessos', 'Hipermercado', 'Hospital', 'Polícia', 'Praça Táxis', 'Praia', 'Transportes Públicos', 'Universidade', 'Vista para Cidade', 'Vista para Mar', 'Vista para Montanha', 'Vista para Rio', 'Zona Comercial', 'Zona Histórica', 'Zona Residencial'].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary p-1 rounded">
                    <input
                      type="checkbox"
                      checked={surroundingArea.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSurroundingArea([...surroundingArea, item]);
                        } else {
                          setSurroundingArea(surroundingArea.filter((i) => i !== item));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {['Ar Condicionado', 'Aquecimento Central', 'Aspiração Central', 'Bomba de Calor', 'Caldeira', 'Carregamento Eléctrico', 'Domótica', 'Elevador', 'Estores Eléctricos', 'Exaustor', 'Fogão', 'Forno', 'Frigorífico', 'Gás Canalizado', 'Lareira', 'Máquina Lavar Louça', 'Máquina Lavar Roupa', 'Máquina Secar Roupa', 'Microondas', 'Painéis Solares', 'Piso Radiante', 'Placa Vitrocerâmica', 'Poliban', 'Porta Blindada', 'Recuperador de Calor', 'Roupeiros', 'Termoacumulador', 'Vídeo Porteiro', 'Vidros Duplos'].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary p-1 rounded">
                    <input
                      type="checkbox"
                      checked={equipment.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEquipment([...equipment, item]);
                        } else {
                          setEquipment(equipment.filter((i) => i !== item));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Extras */}
          <Card>
            <CardHeader>
              <CardTitle>Extras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {['Alarme', 'Arrecadação', 'Barbecue', 'Box', 'Churrasqueira', 'Despensa', 'Garagem', 'Jardim', 'Lugar de Estacionamento', 'Luz Natural', 'Piscina', 'Quintal', 'Sotão', 'Suite', 'Terraço', 'Varanda', 'Vista Desafogada'].map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-secondary p-1 rounded">
                    <input
                      type="checkbox"
                      checked={extras.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExtras([...extras, item]);
                        } else {
                          setExtras(extras.filter((i) => i !== item));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    {item}
                  </label>
                ))}
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
                  onBlur={(e) => handleFieldBlur('price', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="price_on_request"
                  checked={watch('price_on_request')}
                  onChange={(e) => handleCheckboxChange('price_on_request', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="price_on_request" className="text-sm font-normal">
                  Preço sob consulta
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
