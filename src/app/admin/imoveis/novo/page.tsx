'use client';

import { useState } from 'react';
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
} from 'lucide-react';

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
  to_recover: 'Para Recuperar',
  renovated: 'Renovado',
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

export default function NewPropertyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [brochure, setBrochure] = useState<File | null>(null);
  const [floorPlans, setFloorPlans] = useState<File[]>([]);
  const [floorPlansPreviews, setFloorPlansPreviews] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [surroundingArea, setSurroundingArea] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      status: 'published',
      business_type: 'sale',
      nature: 'apartment',
      price_on_request: false,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
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
    setIsLoading(true);
    try {
      const slug = generateSlug(data.title) + '-' + Date.now();
      
      // Complete property data with all fields
      const propertyData = {
        title: data.title,
        reference: data.reference,
        description: data.description || '',
        business_type: data.business_type,
        nature: data.nature,
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
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        floors: data.floors ? parseInt(data.floors) : null,
        typology: data.typology || '',
        construction_status: data.construction_status || 'used',
        construction_year: data.construction_year ? parseInt(data.construction_year) : null,
        energy_certificate: data.energy_certificate || '',
        video_url: data.video_url || '',
        virtual_tour_url: data.virtual_tour_url || '',
        equipment: equipment.length > 0 ? equipment : null,
        extras: extras.length > 0 ? extras : null,
        surrounding_area: surroundingArea.length > 0 ? surroundingArea : null,
      };

      console.log('Creating property:', propertyData);

      // Use fetch to create property
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Insert error:', error);
        toast.error(error.message || 'Erro ao criar imóvel');
        return;
      }

      const property = await response.json();
      console.log('Property created:', property);

      // Upload images
      if (images.length > 0 && property) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${property.id}/${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName);

            await supabase.from('property_images').insert({
              property_id: property.id,
              url: publicUrl,
              order: i,
              is_cover: i === 0,
            });
          }
        }
      }

      // Upload brochure
      if (brochure && property) {
        const fileExt = brochure.name.split('.').pop();
        const fileName = `${property.id}/brochure-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('property-documents')
          .upload(fileName, brochure);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('property-documents')
            .getPublicUrl(fileName);

          // Update property with brochure URL
          await supabase
            .from('properties')
            .update({ brochure_url: publicUrl })
            .eq('id', property.id);
        }
      }

      // Upload floor plans
      if (floorPlans.length > 0 && property) {
        for (let i = 0; i < floorPlans.length; i++) {
          const file = floorPlans[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${property.id}/floorplan-${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('property-documents')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('property-documents')
              .getPublicUrl(fileName);

            await supabase.from('property_floor_plans').insert({
              property_id: property.id,
              url: publicUrl,
              title: file.name,
              order: i,
            });
          }
        }
      }

      toast.success('Imóvel criado com sucesso!');
      router.push('/admin/imoveis');
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error(error.message || 'Erro ao criar imóvel');
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-muted-foreground">Preencha os dados do imóvel</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePreview} disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Button>
          <Button variant="gold" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
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
                    defaultValue="sale"
                    onValueChange={(value) => setValue('business_type', value as any)}
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
                    defaultValue="apartment"
                    onValueChange={(value) => setValue('nature', value as any)}
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
                  <Label>Estado do Imóvel</Label>
                  <Select
                    defaultValue="used"
                    onValueChange={(value) => setValue('construction_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(constructionStatusLabels).map(([value, label]) => (
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
                  <Input {...register('district')} placeholder="Ex: Lisboa" />
                </div>
                <div className="space-y-2">
                  <Label>Concelho</Label>
                  <Input {...register('municipality')} placeholder="Ex: Lisboa" />
                </div>
                <div className="space-y-2">
                  <Label>Freguesia</Label>
                  <Input {...register('parish')} placeholder="Ex: Avenidas Novas" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Morada</Label>
                  <Input {...register('address')} placeholder="Rua, número, andar..." />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input {...register('postal_code')} placeholder="0000-000" />
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
                  <Input {...register('gross_area')} type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Área Útil (m²)</Label>
                  <Input {...register('useful_area')} type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Área Terreno (m²)</Label>
                  <Input {...register('land_area')} type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Quartos</Label>
                  <Input {...register('bedrooms')} type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Casas de Banho</Label>
                  <Input {...register('bathrooms')} type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Input {...register('floors')} type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Ano Construção</Label>
                  <Input {...register('construction_year')} type="number" placeholder="2024" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estado de Construção</Label>
                  <Select onValueChange={(value) => setValue('construction_status', value as any)}>
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
                  <Select onValueChange={(value) => setValue('energy_certificate', value)}>
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
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-yellow-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 text-xs bg-gold-500 text-white px-2 py-0.5 rounded">
                            Capa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
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
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="price_on_request"
                  {...register('price_on_request')}
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
