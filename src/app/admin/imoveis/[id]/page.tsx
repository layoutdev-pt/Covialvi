'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Video,
  FileText,
  Layers,
  TreePine,
  Settings,
  Sparkles,
  Plus,
  X,
  Upload,
  Trash2,
} from 'lucide-react';

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

interface Division {
  name: string;
  area: string;
}

const estadoOptions = [
  'Em construção',
  'Em projecto',
  'Novo',
  'Por recuperar',
  'Recuperado',
  'Renovado',
  'Usado',
  'Vendido',
];

const constructionStatusLabels: Record<string, string> = {
  new: 'Novo',
  used: 'Usado',
  under_construction: 'Em Construção',
  renovated: 'Renovado',
  to_renovate: 'Para Renovar',
};

const zonaEnvolventeOptions = [
  'Ampla Oferta de Serviços',
  'Biblioteca',
  'Centro Comercial',
  'Condomínio Fechado',
  'Escola',
  'Espaços Verdes',
  'Estação Ferroviária',
  'Estação Rodoviária',
  'Excelentes Acessos',
  'Hipermercado',
  'Hospital',
  'Polícia',
  'Praça Táxis',
  'Praia',
  'Transportes Públicos',
  'Universidade',
  'Vista para Cidade',
  'Vista para Mar',
  'Vista para Montanha',
  'Vista para Rio',
  'Zona Comercial',
  'Zona Histórica',
  'Zona Residencial',
];

const equipamentosOptions = [
  'Ar Condicionado',
  'Aquecimento Central',
  'Aspiração Central',
  'Bomba de Calor',
  'Caldeira',
  'Carregamento Eléctrico de Veículos',
  'Combinado',
  'Domótica',
  'Elevador',
  'Estores Eléctricos',
  'Exaustor',
  'Fogão',
  'Forno',
  'Frigorífico',
  'Gás Canalizado',
  'Lareira',
  'Máquina de Lavar Louça',
  'Máquina de Lavar Roupa',
  'Máquina de Secar Roupa',
  'Microondas',
  'Painéis Solares',
  'Piso Radiante',
  'Placa Vitrocerâmica',
  'Poliban/Base de Duche',
  'Porta Blindada',
  'Recuperador de Calor',
  'Roupeiros',
  'Termoacumulador',
  'Vídeo Porteiro',
  'Vidros Duplos',
];

const extrasOptions = [
  'Alarme',
  'Arrecadação',
  'Barbecue',
  'Box',
  'Churrasqueira',
  'Despensa',
  'Garagem',
  'Jardim',
  'Lugar de Estacionamento',
  'Luz Natural',
  'Piscina',
  'Quintal',
  'Sotão',
  'Suite',
  'Terraço',
  'Varanda',
  'Vista Desafogada',
];

const energyCertificateOptions = [
  'A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', 'Isento', 'Em Processo',
];

const typologyOptions = [
  'T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6+',
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
  
  // Images state
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  
  // Additional state for arrays
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedZonaEnvolvente, setSelectedZonaEnvolvente] = useState<string[]>([]);
  const [selectedEquipamentos, setSelectedEquipamentos] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  
  // Custom options state
  const [customZonaEnvolvente, setCustomZonaEnvolvente] = useState<string[]>([]);
  const [customEquipamentos, setCustomEquipamentos] = useState<string[]>([]);
  const [customExtras, setCustomExtras] = useState<string[]>([]);
  const [newZonaInput, setNewZonaInput] = useState('');
  const [newEquipamentoInput, setNewEquipamentoInput] = useState('');
  const [newExtraInput, setNewExtraInput] = useState('');
  
  // Brochure and Floor Plan state
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);
  const [isUploadingFloorPlan, setIsUploadingFloorPlan] = useState(false);

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

  // Combined options
  const allZonaEnvolventeOptions = [...zonaEnvolventeOptions, ...customZonaEnvolvente];
  const allEquipamentosOptions = [...equipamentosOptions, ...customEquipamentos];
  const allExtrasOptions = [...extrasOptions, ...customExtras];

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

        // Set arrays
        if (property.surrounding_area) setSelectedZonaEnvolvente(property.surrounding_area);
        if (property.equipment) setSelectedEquipamentos(property.equipment);
        if (property.extras) setSelectedExtras(property.extras);
        if (property.construction_status) setSelectedEstado(property.construction_status);
        
        // Load divisions from database
        if (property.divisions && typeof property.divisions === 'object') {
          const loadedDivisions = Object.entries(property.divisions).map(([name, area]) => ({
            name,
            area: String(area),
          }));
          setDivisions(loadedDivisions);
        }
        
        // Load brochure and floor plan URLs
        if (property.brochure_url) setBrochureUrl(property.brochure_url);
        if (property.property_floor_plans?.length > 0) {
          setFloorPlanUrl(property.property_floor_plans[0].url);
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

  // Division handlers
  const addDivision = () => {
    setDivisions([...divisions, { name: '', area: '' }]);
  };

  const updateDivision = (index: number, field: 'name' | 'area', value: string) => {
    const updated = [...divisions];
    updated[index][field] = value;
    setDivisions(updated);
  };

  const removeDivision = (index: number) => {
    setDivisions(divisions.filter((_, i) => i !== index));
  };

  // Toggle handlers
  const toggleZonaEnvolvente = (item: string) => {
    setSelectedZonaEnvolvente(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleEquipamento = (item: string) => {
    setSelectedEquipamentos(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleExtra = (item: string) => {
    setSelectedExtras(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Add custom options
  const addCustomZona = () => {
    if (newZonaInput.trim() && !customZonaEnvolvente.includes(newZonaInput.trim())) {
      setCustomZonaEnvolvente(prev => [...prev, newZonaInput.trim()]);
      setSelectedZonaEnvolvente(prev => [...prev, newZonaInput.trim()]);
      setNewZonaInput('');
    }
  };

  const addCustomEquipamento = () => {
    if (newEquipamentoInput.trim() && !customEquipamentos.includes(newEquipamentoInput.trim())) {
      setCustomEquipamentos(prev => [...prev, newEquipamentoInput.trim()]);
      setSelectedEquipamentos(prev => [...prev, newEquipamentoInput.trim()]);
      setNewEquipamentoInput('');
    }
  };

  const addCustomExtra = () => {
    if (newExtraInput.trim() && !customExtras.includes(newExtraInput.trim())) {
      setCustomExtras(prev => [...prev, newExtraInput.trim()]);
      setSelectedExtras(prev => [...prev, newExtraInput.trim()]);
      setNewExtraInput('');
    }
  };

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

  const onSubmit = async (data: PropertyFormData) => {
    setIsSaving(true);
    try {
      // Build divisions data
      const divisionsData = divisions.filter(d => d.name && d.area).reduce((acc, d) => {
        acc[d.name] = parseFloat(d.area);
        return acc;
      }, {} as Record<string, number>);

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
        construction_status: selectedEstado || data.construction_status || null,
        construction_year: data.construction_year ? parseInt(data.construction_year) : null,
        energy_certificate: data.energy_certificate || null,
        video_url: data.video_url || null,
        virtual_tour_url: data.virtual_tour_url || null,
        divisions: Object.keys(divisionsData).length > 0 ? divisionsData : null,
        surrounding_area: selectedZonaEnvolvente.length > 0 ? selectedZonaEnvolvente : null,
        equipment: selectedEquipamentos.length > 0 ? selectedEquipamentos : null,
        extras: selectedExtras.length > 0 ? selectedExtras : null,
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

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Tipo de Negócio *</Label>
                  <Select
                    value={watch('business_type')}
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
                    value={watch('nature')}
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
                <div className="space-y-2">
                  <Label>Tipologia</Label>
                  <Select
                    value={watch('typology') || ''}
                    onValueChange={(value) => setValue('typology', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {typologyOptions.map((typ) => (
                        <SelectItem key={typ} value={typ}>{typ}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado da Propriedade</Label>
                  <Select
                    value={selectedEstado}
                    onValueChange={(value) => setSelectedEstado(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição do Imóvel</Label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="Descreva o imóvel em detalhe..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
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
                  <Input {...register('district')} placeholder="Ex: Castelo Branco" />
                </div>
                <div className="space-y-2">
                  <Label>Concelho</Label>
                  <Input {...register('municipality')} placeholder="Ex: Covilhã" />
                </div>
                <div className="space-y-2">
                  <Label>Freguesia</Label>
                  <Input {...register('parish')} placeholder="Ex: Covilhã e Canhoso" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Morada</Label>
                <Input {...register('address')} placeholder="Rua, número, andar..." />
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
                  <Input {...register('gross_area')} type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Área Útil (m²)</Label>
                  <Input {...register('useful_area')} type="number" placeholder="0" />
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
                  <Select
                    value={watch('construction_status') || ''}
                    onValueChange={(value) => setValue('construction_status', value as any)}
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
                    onValueChange={(value) => setValue('energy_certificate', value)}
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

          {/* Divisions with Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Layers className="mr-2 h-5 w-5" />
                  Divisões e Áreas
                </span>
                <Button type="button" variant="outline" size="sm" onClick={addDivision}>
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {divisions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Clique em &ldquo;Adicionar&rdquo; para inserir divisões com as respetivas áreas.
                </p>
              ) : (
                divisions.map((division, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <Input
                      value={division.name}
                      onChange={(e) => updateDivision(index, 'name', e.target.value)}
                      placeholder="Ex: Quarto, Sala, Cozinha..."
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        value={division.area}
                        onChange={(e) => updateDivision(index, 'area', e.target.value)}
                        placeholder="0"
                        type="number"
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">m²</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDivision(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Zona Envolvente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="mr-2 h-5 w-5" />
                Zona Envolvente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {allZonaEnvolventeOptions.map((item) => {
                  const isSelected = selectedZonaEnvolvente.includes(item);
                  return (
                    <div key={item} className="relative group">
                      <button
                        type="button"
                        onClick={() => toggleZonaEnvolvente(item)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isSelected
                            ? 'bg-yellow-500 text-white border-yellow-500 pr-7'
                            : 'bg-background border-input hover:border-yellow-300'
                        }`}
                      >
                        {item}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleZonaEnvolvente(item);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                          title="Remover"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newZonaInput}
                  onChange={(e) => setNewZonaInput(e.target.value)}
                  placeholder="Adicionar nova opção..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomZona())}
                />
                <Button type="button" variant="outline" onClick={addCustomZona}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedZonaEnvolvente.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedZonaEnvolvente.length} selecionado(s)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {allEquipamentosOptions.map((item) => {
                  const isSelected = selectedEquipamentos.includes(item);
                  return (
                    <div key={item} className="relative group">
                      <button
                        type="button"
                        onClick={() => toggleEquipamento(item)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isSelected
                            ? 'bg-yellow-500 text-white border-yellow-500 pr-7'
                            : 'bg-background border-input hover:border-yellow-300'
                        }`}
                      >
                        {item}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEquipamento(item);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                          title="Remover"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newEquipamentoInput}
                  onChange={(e) => setNewEquipamentoInput(e.target.value)}
                  placeholder="Adicionar novo equipamento..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEquipamento())}
                />
                <Button type="button" variant="outline" onClick={addCustomEquipamento}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedEquipamentos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedEquipamentos.length} selecionado(s)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Extras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Extras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {allExtrasOptions.map((item) => {
                  const isSelected = selectedExtras.includes(item);
                  return (
                    <div key={item} className="relative group">
                      <button
                        type="button"
                        onClick={() => toggleExtra(item)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          isSelected
                            ? 'bg-yellow-500 text-white border-yellow-500 pr-7'
                            : 'bg-background border-input hover:border-yellow-300'
                        }`}
                      >
                        {item}
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExtra(item);
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                          title="Remover"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newExtraInput}
                  onChange={(e) => setNewExtraInput(e.target.value)}
                  placeholder="Adicionar novo extra..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomExtra())}
                />
                <Button type="button" variant="outline" onClick={addCustomExtra}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedExtras.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedExtras.length} selecionado(s)
                </p>
              )}
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

          {/* Brochure & Floor Plan Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brochure Upload */}
              <div className="space-y-3">
                <Label>Brochura (PDF)</Label>
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
              </div>

              {/* Floor Plan Upload */}
              <div className="space-y-3">
                <Label>Planta (PDF/Imagem)</Label>
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
                      <Layers className="h-4 w-4 text-yellow-500" />
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
              </div>
            </CardContent>
          </Card>

          {/* Video & Virtual Tour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Vídeo e Tour Virtual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Link do Vídeo (YouTube, Vimeo, etc.)</Label>
                <Input {...register('video_url')} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div className="space-y-2">
                <Label>Link do Tour Virtual 360º</Label>
                <Input {...register('virtual_tour_url')} placeholder="https://..." />
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

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Publicação</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
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
