'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Home, 
  MapPin, 
  TreePine,
  HelpCircle,
  Clock,
  Euro,
  Phone,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Bed,
  Bath,
  Car,
  Maximize,
  Calendar,
  Wrench,
  Sun,
  Thermometer,
  Shield,
  Waves,
  Mountain,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { PORTUGAL_DISTRICTS, getMunicipalitiesByDistrict } from '@/lib/portugal-locations';

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

enum WizardStep {
  PROPERTY_TYPE = 0,
  LOCATION = 1,
  PROPERTY_DETAILS = 2,
  PROPERTY_FEATURES = 3,
  PROPERTY_CONDITION = 4,
  SELLING_INFO = 5,
  CONTACT_INFO = 6,
  SUCCESS = 7,
}

const WIZARD_STEPS = [
  {
    id: WizardStep.PROPERTY_TYPE,
    key: 'property_type',
    title: 'Tipo de Imóvel',
    question: 'Que tipo de imóvel pretende avaliar?',
    required: true,
  },
  {
    id: WizardStep.LOCATION,
    key: 'location',
    title: 'Localização',
    question: 'Onde se localiza o imóvel?',
    required: true,
  },
  {
    id: WizardStep.PROPERTY_DETAILS,
    key: 'property_details',
    title: 'Detalhes do Imóvel',
    question: 'Quais são as características principais?',
    required: true,
  },
  {
    id: WizardStep.PROPERTY_FEATURES,
    key: 'property_features',
    title: 'Características',
    question: 'Que características especiais tem o imóvel?',
    required: false,
  },
  {
    id: WizardStep.PROPERTY_CONDITION,
    key: 'property_condition',
    title: 'Estado do Imóvel',
    question: 'Qual é o estado atual do imóvel?',
    required: true,
  },
  {
    id: WizardStep.SELLING_INFO,
    key: 'selling_info',
    title: 'Informação de Venda',
    question: 'Informações sobre a venda',
    required: true,
  },
  {
    id: WizardStep.CONTACT_INFO,
    key: 'contact_info',
    title: 'Contacto',
    question: 'Os seus dados de contacto',
    required: true,
  },
] as const;

const TOTAL_STEPS = WIZARD_STEPS.length;

// =============================================================================
// OPTION CONFIGURATIONS
// =============================================================================

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartamento', icon: Building2 },
  { value: 'house', label: 'Moradia', icon: Home },
  { value: 'land', label: 'Terreno', icon: TreePine },
  { value: 'commercial', label: 'Comercial', icon: Building2 },
  { value: 'other', label: 'Outro', icon: HelpCircle },
] as const;

const PROPERTY_CONDITION_OPTIONS = [
  { value: 'new', label: 'Novo' },
  { value: 'like_new', label: 'Como Novo' },
  { value: 'good', label: 'Bom Estado' },
  { value: 'needs_renovation', label: 'A Necessitar de Obras' },
  { value: 'to_renovate', label: 'Para Renovar Totalmente' },
] as const;

const SELLING_STAGE_OPTIONS = [
  { value: 'urgent', label: 'Quero vender o mais rapidamente possível' },
  { value: 'evaluating', label: 'Estou a avaliar o mercado' },
  { value: 'next_months', label: 'Pretendo vender nos próximos meses' },
  { value: 'just_curious', label: 'Apenas quero saber o valor' },
] as const;

const ESTIMATED_VALUE_OPTIONS = [
  { value: 'up_to_100k', label: 'Até 100.000 €' },
  { value: '100k_150k', label: '100.000 € – 150.000 €' },
  { value: '150k_200k', label: '150.000 € – 200.000 €' },
  { value: '200k_300k', label: '200.000 € – 300.000 €' },
  { value: '300k_500k', label: '300.000 € – 500.000 €' },
  { value: '500k_750k', label: '500.000 € – 750.000 €' },
  { value: '750k_1m', label: '750.000 € – 1.000.000 €' },
  { value: 'above_1m', label: 'Mais de 1.000.000 €' },
  { value: 'unknown', label: 'Não sei / Pretendo uma avaliação' },
] as const;

const FEATURE_OPTIONS = [
  { value: 'pool', label: 'Piscina', icon: Waves },
  { value: 'garden', label: 'Jardim', icon: TreePine },
  { value: 'terrace', label: 'Terraço', icon: Sun },
  { value: 'balcony', label: 'Varanda', icon: Sun },
  { value: 'garage', label: 'Garagem', icon: Car },
  { value: 'parking', label: 'Estacionamento', icon: Car },
  { value: 'elevator', label: 'Elevador', icon: Building2 },
  { value: 'air_conditioning', label: 'Ar Condicionado', icon: Thermometer },
  { value: 'central_heating', label: 'Aquecimento Central', icon: Thermometer },
  { value: 'fireplace', label: 'Lareira', icon: Home },
  { value: 'alarm', label: 'Alarme', icon: Shield },
  { value: 'sea_view', label: 'Vista Mar', icon: Waves },
  { value: 'mountain_view', label: 'Vista Serra', icon: Mountain },
  { value: 'city_view', label: 'Vista Cidade', icon: Building2 },
] as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface FormData {
  // Property Type
  propertyType: string;
  
  // Location
  district: string;
  municipality: string;
  parish: string;
  address: string;
  postalCode: string;
  
  // Property Details
  bedrooms: string;
  bathrooms: string;
  grossArea: string;
  usefulArea: string;
  plotArea: string;
  floor: string;
  yearBuilt: string;
  
  // Features
  features: string[];
  
  // Condition
  condition: string;
  lastRenovation: string;
  renovationDetails: string;
  
  // Selling Info
  sellingStage: string;
  estimatedValue: string;
  currentlyRented: string;
  monthlyRent: string;
  
  // Contact
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  additionalNotes: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const INITIAL_FORM_DATA: FormData = {
  propertyType: '',
  district: '',
  municipality: '',
  parish: '',
  address: '',
  postalCode: '',
  bedrooms: '',
  bathrooms: '',
  grossArea: '',
  usefulArea: '',
  plotArea: '',
  floor: '',
  yearBuilt: '',
  features: [],
  condition: '',
  lastRenovation: '',
  renovationDetails: '',
  sellingStage: '',
  estimatedValue: '',
  currentlyRented: '',
  monthlyRent: '',
  name: '',
  email: '',
  phone: '',
  preferredContact: '',
  additionalNotes: '',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AvaliacaoCompletaPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.PROPERTY_TYPE);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progressPercentage = Math.round((currentStep / TOTAL_STEPS) * 100);
  const isLastStep = currentStep === WizardStep.CONTACT_INFO;
  const isSuccessStep = currentStep === WizardStep.SUCCESS;

  // Get municipalities based on selected district
  const municipalities = formData.district ? getMunicipalitiesByDistrict(formData.district) : [];

  const validateStep = useCallback((step: WizardStep): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case WizardStep.PROPERTY_TYPE:
        if (!formData.propertyType) {
          newErrors.propertyType = 'Por favor, selecione o tipo de imóvel.';
        }
        break;
        
      case WizardStep.LOCATION:
        if (!formData.district) {
          newErrors.district = 'Por favor, selecione o distrito.';
        }
        if (!formData.municipality) {
          newErrors.municipality = 'Por favor, selecione o concelho.';
        }
        break;
        
      case WizardStep.PROPERTY_DETAILS:
        if (formData.propertyType !== 'land') {
          if (!formData.bedrooms) {
            newErrors.bedrooms = 'Por favor, indique o número de quartos.';
          }
        }
        break;
        
      case WizardStep.PROPERTY_CONDITION:
        if (!formData.condition) {
          newErrors.condition = 'Por favor, selecione o estado do imóvel.';
        }
        break;
        
      case WizardStep.SELLING_INFO:
        if (!formData.sellingStage) {
          newErrors.sellingStage = 'Por favor, selecione a fase de venda.';
        }
        break;
        
      case WizardStep.CONTACT_INFO:
        if (!formData.phone) {
          newErrors.phone = 'Por favor, indique o seu número de telefone.';
        } else if (!/^(\+351)?[0-9\s]{9,}$/.test(formData.phone.replace(/\s/g, ''))) {
          newErrors.phone = 'Por favor, indique um número de telefone válido.';
        }
        if (!formData.name) {
          newErrors.name = 'Por favor, indique o seu nome.';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Por favor, indique um email válido.';
        }
        break;
    }
    
    return newErrors;
  }, [formData]);

  const canProceed = useCallback((): boolean => {
    const stepErrors = validateStep(currentStep);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, validateStep]);

  const updateFormField = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const toggleFeature = useCallback((feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, WizardStep.SUCCESS) as WizardStep);
  }, [currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, WizardStep.PROPERTY_TYPE) as WizardStep);
  }, []);

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/leads/complete-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao submeter o formulário');
      }

      setCurrentStep(WizardStep.SUCCESS);
    } catch (error) {
      setErrors({ submit: 'Ocorreu um erro ao enviar o seu pedido. Por favor, tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionSelect = useCallback((field: keyof FormData, value: string) => {
    updateFormField(field, value);
    setTimeout(() => {
      if (field === 'propertyType' || field === 'condition' || field === 'sellingStage') {
        goToNextStep();
      }
    }, 300);
  }, [updateFormField, goToNextStep]);

  // ---------------------------------------------------------------------------
  // RENDER STEP CONTENT
  // ---------------------------------------------------------------------------

  const renderStepContent = () => {
    switch (currentStep) {
      case WizardStep.PROPERTY_TYPE:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROPERTY_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.propertyType === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('propertyType', option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-500 shadow-lg'
                        : 'border-border hover:border-yellow-500 hover:bg-yellow-500 bg-card'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-muted text-muted-foreground group-hover:bg-black group-hover:text-white'
                      }`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className={`font-semibold text-base transition-colors ${
                        isSelected ? 'text-black' : 'text-foreground group-hover:text-black'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black flex items-center justify-center"
                      >
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {errors.propertyType && (
              <p className="text-sm text-red-500 text-center">{errors.propertyType}</p>
            )}
          </div>
        );

      case WizardStep.LOCATION:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Distrito <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => {
                    updateFormField('district', value);
                    updateFormField('municipality', '');
                  }}
                >
                  <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o distrito" />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTUGAL_DISTRICTS.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
              </div>

              <div className="space-y-2">
                <Label>Concelho <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.municipality}
                  onValueChange={(value) => updateFormField('municipality', value)}
                  disabled={!formData.district}
                >
                  <SelectTrigger className={errors.municipality ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o concelho" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((municipality) => (
                      <SelectItem key={municipality.value} value={municipality.value}>
                        {municipality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipality && <p className="text-sm text-red-500">{errors.municipality}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Freguesia (opcional)</Label>
              <Input
                value={formData.parish}
                onChange={(e) => updateFormField('parish', e.target.value)}
                placeholder="Ex: São Domingos de Benfica"
              />
            </div>

            <div className="space-y-2">
              <Label>Morada (opcional)</Label>
              <Input
                value={formData.address}
                onChange={(e) => updateFormField('address', e.target.value)}
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>

            <div className="space-y-2">
              <Label>Código Postal (opcional)</Label>
              <Input
                value={formData.postalCode}
                onChange={(e) => updateFormField('postalCode', e.target.value)}
                placeholder="Ex: 1000-001"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Seguinte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case WizardStep.PROPERTY_DETAILS:
        return (
          <div className="space-y-6">
            {formData.propertyType !== 'land' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Quartos <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.bedrooms}
                      onValueChange={(value) => updateFormField('bedrooms', value)}
                    >
                      <SelectTrigger className={errors.bedrooms ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {['0', '1', '2', '3', '4', '5', '6+'].map((num) => (
                          <SelectItem key={num} value={num}>{num === '0' ? 'T0' : num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      Casas de Banho
                    </Label>
                    <Select
                      value={formData.bathrooms}
                      onValueChange={(value) => updateFormField('bathrooms', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {['1', '2', '3', '4', '5+'].map((num) => (
                          <SelectItem key={num} value={num}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Maximize className="h-4 w-4" />
                      Área Bruta (m²)
                    </Label>
                    <Input
                      type="number"
                      value={formData.grossArea}
                      onChange={(e) => updateFormField('grossArea', e.target.value)}
                      placeholder="Ex: 120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Maximize className="h-4 w-4" />
                      Área Útil (m²)
                    </Label>
                    <Input
                      type="number"
                      value={formData.usefulArea}
                      onChange={(e) => updateFormField('usefulArea', e.target.value)}
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>

                {formData.propertyType === 'apartment' && (
                  <div className="space-y-2">
                    <Label>Andar</Label>
                    <Select
                      value={formData.floor}
                      onValueChange={(value) => updateFormField('floor', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o andar" />
                      </SelectTrigger>
                      <SelectContent>
                        {['R/C', '1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º', '10º+'].map((floor) => (
                          <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {(formData.propertyType === 'land' || formData.propertyType === 'house') && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  Área do Terreno (m²)
                </Label>
                <Input
                  type="number"
                  value={formData.plotArea}
                  onChange={(e) => updateFormField('plotArea', e.target.value)}
                  placeholder="Ex: 500"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ano de Construção
              </Label>
              <Input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => updateFormField('yearBuilt', e.target.value)}
                placeholder="Ex: 2010"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Seguinte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case WizardStep.PROPERTY_FEATURES:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Selecione todas as características que se aplicam ao seu imóvel
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FEATURE_OPTIONS.map((feature) => {
                const Icon = feature.icon;
                const isSelected = formData.features.includes(feature.value);
                return (
                  <button
                    key={feature.value}
                    type="button"
                    onClick={() => toggleFeature(feature.value)}
                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-border hover:border-yellow-300 bg-card'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-yellow-700 dark:text-yellow-400' : 'text-foreground'}`}>
                      {feature.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Seguinte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case WizardStep.PROPERTY_CONDITION:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {PROPERTY_CONDITION_OPTIONS.map((option) => {
                const isSelected = formData.condition === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('condition', option.value)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                      isSelected
                        ? 'border-foreground bg-secondary shadow-md'
                        : 'border-border hover:border-foreground/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Wrench className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-base text-foreground">
                          {option.label}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0"
                        >
                          <CheckCircle2 className="h-4 w-4 text-background" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {(formData.condition === 'needs_renovation' || formData.condition === 'to_renovate') && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Última renovação (ano)</Label>
                  <Input
                    type="number"
                    value={formData.lastRenovation}
                    onChange={(e) => updateFormField('lastRenovation', e.target.value)}
                    placeholder="Ex: 2015"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Detalhes das obras necessárias</Label>
                  <Textarea
                    value={formData.renovationDetails}
                    onChange={(e) => updateFormField('renovationDetails', e.target.value)}
                    placeholder="Descreva as obras necessárias..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {errors.condition && (
              <p className="text-sm text-red-500 text-center">{errors.condition}</p>
            )}
          </div>
        );

      case WizardStep.SELLING_INFO:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Em que fase se encontra?</Label>
              {SELLING_STAGE_OPTIONS.map((option) => {
                const isSelected = formData.sellingStage === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => updateFormField('sellingStage', option.value)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-foreground bg-secondary'
                        : 'border-border hover:border-foreground/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{option.label}</span>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-foreground" />}
                    </div>
                  </motion.button>
                );
              })}
              {errors.sellingStage && <p className="text-sm text-red-500">{errors.sellingStage}</p>}
            </div>

            <div className="space-y-2">
              <Label>Valor estimado do imóvel</Label>
              <Select
                value={formData.estimatedValue}
                onValueChange={(value) => updateFormField('estimatedValue', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma faixa de valor" />
                </SelectTrigger>
                <SelectContent>
                  {ESTIMATED_VALUE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>O imóvel está arrendado?</Label>
              <Select
                value={formData.currentlyRented}
                onValueChange={(value) => updateFormField('currentlyRented', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.currentlyRented === 'yes' && (
              <div className="space-y-2">
                <Label>Renda mensal (€)</Label>
                <Input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => updateFormField('monthlyRent', e.target.value)}
                  placeholder="Ex: 800"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={goToPreviousStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Seguinte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case WizardStep.CONTACT_INFO:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  placeholder="O seu nome completo"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormField('phone', e.target.value)}
                  placeholder="+351 912 345 678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email (opcional)
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormField('email', e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label>Preferência de contacto</Label>
                <Select
                  value={formData.preferredContact}
                  onValueChange={(value) => updateFormField('preferredContact', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="any">Qualquer um</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas adicionais (opcional)</Label>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormField('additionalNotes', e.target.value)}
                  placeholder="Informações adicionais que considere relevantes..."
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Os seus dados são utilizados exclusivamente para este contacto e avaliação do imóvel.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={isSubmitting} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  <>
                    Solicitar Avaliação
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}
          </div>
        );

      case WizardStep.SUCCESS:
        return (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
            >
              Pedido de Avaliação Recebido
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Obrigado por escolher a Covialvi!
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 max-w-md mx-auto mb-8"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Um dos nossos consultores especializados irá analisar as informações fornecidas 
                e entrará em contacto consigo nas próximas 24 horas com uma avaliação detalhada do seu imóvel.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button asChild variant="outline">
                <a href="/">
                  Voltar à Página Inicial
                </a>
              </Button>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-background py-12 px-6 md:px-12 lg:px-20">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Avaliação Completa do Imóvel
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Preencha o formulário detalhado para receber uma avaliação mais precisa e personalizada do seu imóvel.
          </p>
        </div>

        {/* Wizard Card */}
        <Card className="border border-border shadow-lg bg-card rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Progress Bar */}
            {!isSuccessStep && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Passo {currentStep + 1} de {TOTAL_STEPS}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Step Question */}
            {!isSuccessStep && (
              <motion.h3
                key={currentStep}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-8 leading-tight"
              >
                {WIZARD_STEPS[currentStep]?.question}
              </motion.h3>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
