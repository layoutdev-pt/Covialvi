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
  Video,
  FileText,
  Layers,
  TreePine,
  Settings,
  Sparkles,
  Zap,
  Plus,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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

// Division type for rooms with areas
interface Division {
  name: string;
  area: string;
}

// Estado (Property State) options - using standardized English keys
const estadoOptions = [
  { value: 'under_construction', label: 'Em Construção' },
  { value: 'in_project', label: 'Em Projecto' },
  { value: 'new', label: 'Novo' },
  { value: 'to_recover', label: 'Por Recuperar' },
  { value: 'recovered', label: 'Recuperado' },
  { value: 'renovated', label: 'Renovado' },
  { value: 'used', label: 'Usado' },
  { value: 'sold', label: 'Vendido' },
];

// Zona Envolvente options
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

// Equipamentos options
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

// Extras options
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

// Energy certificate options
const energyCertificateOptions = [
  'A+',
  'A',
  'B',
  'B-',
  'C',
  'D',
  'E',
  'F',
  'G',
  'Isento',
  'Em Processo',
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  
  // Additional state for arrays and files
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedZonaEnvolvente, setSelectedZonaEnvolvente] = useState<string[]>([]);
  const [selectedEquipamentos, setSelectedEquipamentos] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedEstado, setSelectedEstado] = useState<string[]>([]);
  const [brochureFiles, setBrochureFiles] = useState<File[]>([]);
  const [floorPlanFiles, setFloorPlanFiles] = useState<File[]>([]);
  const [propertyImages, setPropertyImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const [existingBrochure, setExistingBrochure] = useState<string | null>(null);
  const [existingFloorPlans, setExistingFloorPlans] = useState<any[]>([]);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [isUploadingBrochure, setIsUploadingBrochure] = useState(false);
  
  // Custom options state
  const [customZonaEnvolvente, setCustomZonaEnvolvente] = useState<string[]>([]);
  const [customEquipamentos, setCustomEquipamentos] = useState<string[]>([]);
  const [customExtras, setCustomExtras] = useState<string[]>([]);
  const [newZonaInput, setNewZonaInput] = useState('');
  const [newEquipamentoInput, setNewEquipamentoInput] = useState('');
  const [newExtraInput, setNewExtraInput] = useState('');
  
  // Deleted default options (to hide them from the list)
  const [deletedZonaEnvolvente, setDeletedZonaEnvolvente] = useState<string[]>([]);
  const [deletedEquipamentos, setDeletedEquipamentos] = useState<string[]>([]);
  const [deletedExtras, setDeletedExtras] = useState<string[]>([]);

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
      price_on_request: false,
    },
  });

  // Load existing property data
  useEffect(() => {
    async function loadProperty() {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        if (!response.ok) {
          toast.error('Imóvel não encontrado');
          router.push('/admin/imoveis');
          return;
        }
        
        const data = await response.json();
        setProperty(data);
        
        // Reset form with loaded data
        reset({
          title: data.title || '',
          reference: data.reference || '',
          description: data.description || '',
          business_type: data.business_type || 'sale',
          nature: data.nature || '',
          status: data.status || 'published',
          price: data.price?.toString() || '',
          price_on_request: data.price_on_request || false,
          district: data.district || '',
          municipality: data.municipality || '',
          parish: data.parish || '',
          address: data.address || '',
          gross_area: data.gross_area?.toString() || '',
          useful_area: data.useful_area?.toString() || '',
          land_area: data.land_area?.toString() || '',
          bedrooms: data.bedrooms?.toString() || '',
          bathrooms: data.bathrooms?.toString() || '',
          floors: data.floors?.toString() || '',
          typology: data.typology || '',
          construction_status: data.construction_status || '',
          construction_year: data.construction_year?.toString() || '',
          energy_certificate: data.energy_certificate || '',
          video_url: data.video_url || '',
          virtual_tour_url: data.virtual_tour_url || '',
        });
        
        // Load divisions
        if (data.divisions && typeof data.divisions === 'object') {
          const divs = Object.entries(data.divisions).map(([name, area]) => ({
            name,
            area: String(area),
          }));
          setDivisions(divs);
        }
        
        // Load arrays
        if (data.surrounding_area) setSelectedZonaEnvolvente(data.surrounding_area);
        if (data.equipment) setSelectedEquipamentos(data.equipment);
        if (data.extras) setSelectedExtras(data.extras);
        
        // Load existing images
        if (data.property_images) {
          setExistingImages(data.property_images);
          const urls = data.property_images.map((img: any) => img.url);
          setImagePreviewUrls(urls);
          const coverIdx = data.property_images.findIndex((img: any) => img.is_cover);
          if (coverIdx >= 0) setCoverImageIndex(coverIdx);
        }
        
        // Load existing brochure and floor plans
        if (data.brochure_url) {
          setExistingBrochure(data.brochure_url);
          setBrochureUrl(data.brochure_url);
        }
        if (data.property_floor_plans && data.property_floor_plans.length > 0) {
          setExistingFloorPlans(data.property_floor_plans);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading property:', error);
        toast.error('Erro ao carregar imóvel');
        setIsLoading(false);
      }
    }
    
    loadProperty();
  }, [params.id, reset, router]);

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

  // Toggle handlers for multi-select
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

  // Remove handlers (direct removal without toggle)
  const removeZonaEnvolvente = (item: string) => {
    setSelectedZonaEnvolvente(prev => prev.filter(i => i !== item));
  };

  const removeEquipamento = (item: string) => {
    setSelectedEquipamentos(prev => prev.filter(i => i !== item));
  };

  const removeExtra = (item: string) => {
    setSelectedExtras(prev => prev.filter(i => i !== item));
  };

  const toggleEstado = (item: string) => {
    setSelectedEstado(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Auto-save placeholder functions (not used but referenced in JSX)
  const handleFieldBlur = (field: string, value: any) => {
    // Auto-save not implemented for edit page - saves on submit
  };

  const saveField = (field: string, value: any) => {
    // Auto-save not implemented for edit page - saves on submit
  };

  // File handlers
  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBrochureFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleFloorPlanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFloorPlanFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeBrochure = (index: number) => {
    setBrochureFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeFloorPlan = (index: number) => {
    setFloorPlanFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Property images handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPropertyImages(prev => [...prev, ...files]);
      
      // Create preview URLs
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    // Adjust cover index if needed
    if (index === coverImageIndex) {
      setCoverImageIndex(0);
    } else if (index < coverImageIndex) {
      setCoverImageIndex(prev => prev - 1);
    }
  };

  const setCoverImage = (index: number) => {
    setCoverImageIndex(index);
  };

  // Custom options handlers
  const addCustomZona = () => {
    if (newZonaInput.trim() && !customZonaEnvolvente.includes(newZonaInput.trim()) && !zonaEnvolventeOptions.includes(newZonaInput.trim())) {
      setCustomZonaEnvolvente(prev => [...prev, newZonaInput.trim()]);
      setSelectedZonaEnvolvente(prev => [...prev, newZonaInput.trim()]);
      setNewZonaInput('');
    }
  };

  const addCustomEquipamento = () => {
    if (newEquipamentoInput.trim() && !customEquipamentos.includes(newEquipamentoInput.trim()) && !equipamentosOptions.includes(newEquipamentoInput.trim())) {
      setCustomEquipamentos(prev => [...prev, newEquipamentoInput.trim()]);
      setSelectedEquipamentos(prev => [...prev, newEquipamentoInput.trim()]);
      setNewEquipamentoInput('');
    }
  };

  const addCustomExtra = () => {
    if (newExtraInput.trim() && !customExtras.includes(newExtraInput.trim()) && !extrasOptions.includes(newExtraInput.trim())) {
      setCustomExtras(prev => [...prev, newExtraInput.trim()]);
      setSelectedExtras(prev => [...prev, newExtraInput.trim()]);
      setNewExtraInput('');
    }
  };

  // Delete single pill permanently (custom or default)
  const deleteZonaPill = (item: string) => {
    if (customZonaEnvolvente.includes(item)) {
      setCustomZonaEnvolvente(prev => prev.filter(i => i !== item));
    } else {
      setDeletedZonaEnvolvente(prev => [...prev, item]);
    }
    setSelectedZonaEnvolvente(prev => prev.filter(i => i !== item));
  };

  const deleteEquipamentoPill = (item: string) => {
    if (customEquipamentos.includes(item)) {
      setCustomEquipamentos(prev => prev.filter(i => i !== item));
    } else {
      setDeletedEquipamentos(prev => [...prev, item]);
    }
    setSelectedEquipamentos(prev => prev.filter(i => i !== item));
  };

  const deleteExtraPill = (item: string) => {
    if (customExtras.includes(item)) {
      setCustomExtras(prev => prev.filter(i => i !== item));
    } else {
      setDeletedExtras(prev => [...prev, item]);
    }
    setSelectedExtras(prev => prev.filter(i => i !== item));
  };

  // Delete all selected pills permanently
  const deleteAllSelectedZona = () => {
    // Add selected default options to deleted list
    const defaultsToDelete = selectedZonaEnvolvente.filter(item => zonaEnvolventeOptions.includes(item));
    setDeletedZonaEnvolvente(prev => [...prev, ...defaultsToDelete]);
    // Remove selected custom options
    setCustomZonaEnvolvente(prev => prev.filter(item => !selectedZonaEnvolvente.includes(item)));
    // Clear selection
    setSelectedZonaEnvolvente([]);
  };

  const deleteAllSelectedEquipamentos = () => {
    const defaultsToDelete = selectedEquipamentos.filter(item => equipamentosOptions.includes(item));
    setDeletedEquipamentos(prev => [...prev, ...defaultsToDelete]);
    setCustomEquipamentos(prev => prev.filter(item => !selectedEquipamentos.includes(item)));
    setSelectedEquipamentos([]);
  };

  const deleteAllSelectedExtras = () => {
    const defaultsToDelete = selectedExtras.filter(item => extrasOptions.includes(item));
    setDeletedExtras(prev => [...prev, ...defaultsToDelete]);
    setCustomExtras(prev => prev.filter(item => !selectedExtras.includes(item)));
    setSelectedExtras([]);
  };

  // Combined options (default + custom, excluding deleted)
  const allZonaEnvolventeOptions = [...zonaEnvolventeOptions.filter(o => !deletedZonaEnvolvente.includes(o)), ...customZonaEnvolvente];
  const allEquipamentosOptions = [...equipamentosOptions.filter(o => !deletedEquipamentos.includes(o)), ...customEquipamentos];
  const allExtrasOptions = [...extrasOptions.filter(o => !deletedExtras.includes(o)), ...customExtras];

  const onSubmit = async (data: PropertyFormData) => {
    setIsSaving(true);
    try {
      // Build divisions data for areas - allow divisions without areas (store as 0)
      const divisionsData = divisions.filter(d => d.name).reduce((acc, d) => {
        acc[d.name] = d.area ? parseFloat(d.area) : 0;
        return acc;
      }, {} as Record<string, number>);

      const propertyData = {
        title: data.title,
        reference: data.reference,
        description: data.description || '',
        business_type: data.business_type,
        nature: data.nature,
        status: data.status,
        price: data.price ? parseFloat(data.price) : null,
        price_on_request: data.price_on_request,
        district: data.district || null,
        municipality: data.municipality || null,
        parish: data.parish || null,
        address: data.address || null,
        postal_code: data.postal_code || null,
        gross_area: data.gross_area ? parseFloat(data.gross_area) : null,
        useful_area: data.useful_area ? parseFloat(data.useful_area) : null,
        land_area: data.land_area ? parseFloat(data.land_area) : null,
        bedrooms: data.bedrooms !== undefined && data.bedrooms !== '' ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms !== undefined && data.bathrooms !== '' ? parseInt(data.bathrooms) : null,
        floors: data.floors !== undefined && data.floors !== '' ? parseInt(data.floors) : null,
        typology: data.typology || null,
        construction_status: data.construction_status || null,
        construction_year: data.construction_year ? parseInt(data.construction_year) : null,
        energy_certificate: data.energy_certificate || null,
        video_url: data.video_url || null,
        virtual_tour_url: data.virtual_tour_url || null,
        // Array fields - always save (empty arrays/objects if nothing selected)
        equipment: selectedEquipamentos.length > 0 ? selectedEquipamentos : [],
        extras: selectedExtras.length > 0 ? selectedExtras : [],
        surrounding_area: selectedZonaEnvolvente.length > 0 ? selectedZonaEnvolvente : [],
        divisions: divisionsData,
      };

      console.log('Updating property:', propertyData);

      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        toast.error(result.error || 'Erro ao atualizar imóvel');
        return;
      }

      // Upload new images (only File objects, not existing URLs)
      for (let i = 0; i < propertyImages.length; i++) {
        const file = propertyImages[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('is_cover', (i === coverImageIndex).toString());
        formData.append('order', i.toString());

        const uploadRes = await fetch(`/api/properties/${params.id}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error('Image upload failed:', await uploadRes.text());
        }
      }

      // Upload brochures and floor plans in parallel
      const uploadPromises: Promise<void>[] = [];

      for (const file of brochureFiles) {
        const promise = (async () => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'brochure');

          const uploadRes = await fetch(`/api/properties/${params.id}/documents`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            console.error('Brochure upload failed:', await uploadRes.text());
          }
        })();
        uploadPromises.push(promise);
      }

      for (const file of floorPlanFiles) {
        const promise = (async () => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'floor_plan');

          const uploadRes = await fetch(`/api/properties/${params.id}/documents`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            console.error('Floor plan upload failed:', await uploadRes.text());
          }
        })();
        uploadPromises.push(promise);
      }

      await Promise.all(uploadPromises);

      console.log('Property updated:', result);
      toast.success('Imóvel atualizado com sucesso!');
      router.push('/admin/imoveis');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Erro ao atualizar imóvel');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const formData = watch();
    const previewData = {
      title: formData.title || 'Sem título',
      reference: formData.reference || 'REF-000',
      description: formData.description || '',
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
      construction_year: formData.construction_year,
      energy_certificate: formData.energy_certificate,
    };
    sessionStorage.setItem('propertyPreview', JSON.stringify(previewData));
    window.open('/admin/imoveis/preview', '_blank');
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
          <Button variant="outline" onClick={handlePreview} disabled={isLoading || isSaving}>
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Button>
          <Button variant="gold" onClick={handleSubmit(onSubmit)} disabled={isLoading || isSaving}>
            {isSaving ? (
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
              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-2">
                  <Label>Estado do Imóvel</Label>
                  <Select 
                    value={watch('construction_status') || ''}
                    onValueChange={(value) => {
                      setValue('construction_status', value);
                      saveField('construction_status', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-2">
                  <Label>Tipologia</Label>
                  <Input
                    {...register('typology')}
                    placeholder="Ex: T3"
                  />
                </div>
              </div>

              {/* Description */}
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Área Bruta (m²)</Label>
                  <Input {...register('gross_area')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('gross_area', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ano Construção</Label>
                  <Input {...register('construction_year')} type="number" placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label>Piso</Label>
                  <Input {...register('floors')} type="number" placeholder="0" onBlur={(e) => handleFieldBlur('floors', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria Energética</Label>
                  <Select onValueChange={(value) => setValue('energy_certificate', value)}>
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
                  const isCustom = customZonaEnvolvente.includes(item);
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
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteZonaPill(item);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center transition-all z-10 cursor-pointer bg-red-600 hover:bg-red-700"
                          title="Eliminar opção"
                        >
                          <X className="h-3 w-3 pointer-events-none" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Add custom option */}
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
                {selectedZonaEnvolvente.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={deleteAllSelectedZona}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar selecionados"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                  const isCustom = customEquipamentos.includes(item);
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
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteEquipamentoPill(item);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center transition-all z-10 cursor-pointer bg-red-600 hover:bg-red-700"
                          title="Eliminar opção"
                        >
                          <X className="h-3 w-3 pointer-events-none" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Add custom option */}
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
                {selectedEquipamentos.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={deleteAllSelectedEquipamentos}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar selecionados"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                  const isCustom = customExtras.includes(item);
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
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteExtraPill(item);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center transition-all z-10 cursor-pointer bg-red-600 hover:bg-red-700"
                          title="Eliminar opção"
                        >
                          <X className="h-3 w-3 pointer-events-none" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Add custom option */}
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
                {selectedExtras.length > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={deleteAllSelectedExtras}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar selecionados"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Clique para carregar imagens
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP (máx. 10MB cada)
                  </p>
                </label>
              </div>
              
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className={`relative group aspect-square rounded-lg overflow-hidden bg-secondary ${index === coverImageIndex ? 'ring-2 ring-yellow-500' : ''}`}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setCoverImage(index)}
                          className="text-white hover:text-white hover:bg-yellow-500"
                          title="Definir como capa"
                        >
                          <Home className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="text-white hover:text-white hover:bg-red-500"
                          title="Remover"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      {index === coverImageIndex && (
                        <span className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">
                          Capa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {propertyImages.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {propertyImages.length} imagem(ns) selecionada(s). Clique no ícone da casa para definir a imagem de capa.
                </p>
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

          {/* File Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brochures */}
              <div className="space-y-3">
                <Label>Brochuras (PDF)</Label>
                {existingBrochure && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <a href={existingBrochure} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline truncate">
                      📄 Brochura existente
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setExistingBrochure(null)}
                      className="h-6 w-6 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleBrochureUpload}
                    className="hidden"
                    id="brochure-upload"
                  />
                  <label htmlFor="brochure-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {existingBrochure ? 'Substituir brochura' : 'Clique para carregar brochuras'}
                    </p>
                  </label>
                </div>
                {brochureFiles.length > 0 && (
                  <div className="space-y-2">
                    {brochureFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBrochure(index)}
                          className="h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Plans */}
              <div className="space-y-3">
                <Label>Plantas (Imagens ou PDF)</Label>
                {existingFloorPlans.length > 0 && (
                  <div className="space-y-2">
                    {existingFloorPlans.map((plan, index) => (
                      <div key={plan.id || index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <a href={plan.url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline truncate">
                          📐 Planta {index + 1}
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setExistingFloorPlans(existingFloorPlans.filter((_, i) => i !== index))}
                          className="h-6 w-6 text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={handleFloorPlanUpload}
                    className="hidden"
                    id="floorplan-upload"
                  />
                  <label htmlFor="floorplan-upload" className="cursor-pointer">
                    <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {existingFloorPlans.length > 0 ? 'Adicionar mais plantas' : 'Clique para carregar plantas'}
                    </p>
                  </label>
                </div>
                {floorPlanFiles.length > 0 && (
                  <div className="space-y-2">
                    {floorPlanFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFloorPlan(index)}
                          className="h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
        </div>
      </form>
    </div>
  );
}
