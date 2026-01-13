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
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { PORTUGAL_DISTRICTS, getMunicipalitiesByDistrict } from '@/lib/portugal-locations';

// =============================================================================
// STEP CONFIGURATION
// =============================================================================

/**
 * Enum representing each step in the wizard flow
 * Designed for easy extension and A/B testing
 */
export enum WizardStep {
  PROPERTY_TYPE = 0,
  LOCATION = 1,
  SELLING_STAGE = 2,
  ESTIMATED_VALUE = 3,
  CONTACT_TIMING = 4,
  LEAD_CAPTURE = 5,
  SUCCESS = 6,
}

/**
 * Step configuration with metadata for progress tracking and validation
 */
export const WIZARD_STEPS = [
  {
    id: WizardStep.PROPERTY_TYPE,
    key: 'property_type',
    title: 'Tipo de Imóvel',
    question: 'O imóvel que pretende vender é de que tipo?',
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
    id: WizardStep.SELLING_STAGE,
    key: 'selling_stage',
    title: 'Fase de Venda',
    question: 'Em que fase se encontra o processo de venda?',
    required: true,
  },
  {
    id: WizardStep.ESTIMATED_VALUE,
    key: 'estimated_value',
    title: 'Valor Estimado',
    question: 'Qual o valor estimado do imóvel?',
    required: true,
  },
  {
    id: WizardStep.CONTACT_TIMING,
    key: 'contact_timing',
    title: 'Preferência de Contacto',
    question: 'Quando gostaria de ser contactado?',
    required: true,
  },
  {
    id: WizardStep.LEAD_CAPTURE,
    key: 'lead_capture',
    title: 'Contacto',
    question: 'Receba uma avaliação gratuita e personalizada',
    required: true,
  },
] as const;

export const TOTAL_STEPS = WIZARD_STEPS.length;

// =============================================================================
// OPTION CONFIGURATIONS
// =============================================================================

/**
 * Property type options with icons
 */
export const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartamento', icon: Building2 },
  { value: 'house', label: 'Moradia', icon: Home },
  { value: 'land', label: 'Terreno', icon: TreePine },
  { value: 'other', label: 'Outro', icon: HelpCircle },
] as const;

/**
 * Selling stage options
 */
export const SELLING_STAGE_OPTIONS = [
  { value: 'urgent', label: 'Quero vender o mais rapidamente possível' },
  { value: 'evaluating', label: 'Estou a avaliar o mercado' },
  { value: 'next_months', label: 'Pretendo vender nos próximos meses' },
] as const;

/**
 * Estimated value ranges
 */
export const ESTIMATED_VALUE_OPTIONS = [
  { value: 'up_to_150k', label: 'Até 150.000 €' },
  { value: '150k_300k', label: '150.000 € – 300.000 €' },
  { value: '300k_500k', label: '300.000 € – 500.000 €' },
  { value: 'above_500k', label: 'Mais de 500.000 €' },
  { value: 'unknown', label: 'Não sei / Pretendo uma avaliação' },
] as const;

/**
 * Contact timing preferences
 */
export const CONTACT_TIMING_OPTIONS = [
  { value: 'asap', label: 'O mais breve possível' },
  { value: 'next_days', label: 'Nos próximos dias' },
  { value: 'info_only', label: 'Apenas para informações' },
] as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Form data structure for all wizard answers
 */
export interface WizardFormData {
  // Step 1: Property Type
  propertyType: string;
  
  // Step 2: Location
  district: string;
  municipality: string;
  
  // Step 3: Selling Stage
  sellingStage: string;
  
  // Step 4: Estimated Value
  estimatedValue: string;
  
  // Step 5: Contact Timing
  contactTiming: string;
  
  // Step 6: Lead Capture
  phone: string;
  name: string;
  email: string;
}

/**
 * Initial form state
 */
const INITIAL_FORM_DATA: WizardFormData = {
  propertyType: '',
  district: '',
  municipality: '',
  sellingStage: '',
  estimatedValue: '',
  contactTiming: '',
  phone: '',
  name: '',
  email: '',
};

/**
 * Validation errors structure
 */
export interface ValidationErrors {
  [key: string]: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SellPropertyWizard() {
  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.PROPERTY_TYPE);
  
  // Form data collected across all steps
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);
  
  // Validation errors for current step
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success state after submission
  const [isSuccess, setIsSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // COMPUTED VALUES
  // ---------------------------------------------------------------------------
  
  // Calculate progress percentage (excluding success step)
  const progressPercentage = Math.round((currentStep / TOTAL_STEPS) * 100);
  
  // Check if we're on the last input step (before success)
  const isLastStep = currentStep === WizardStep.LEAD_CAPTURE;
  
  // Check if we're showing success state
  const isSuccessStep = currentStep === WizardStep.SUCCESS;

  // ---------------------------------------------------------------------------
  // VALIDATION LOGIC
  // ---------------------------------------------------------------------------
  
  /**
   * Validates the current step and returns validation errors
   * Each step has specific required fields
   */
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
        
      case WizardStep.SELLING_STAGE:
        if (!formData.sellingStage) {
          newErrors.sellingStage = 'Por favor, selecione a fase de venda.';
        }
        break;
        
      case WizardStep.ESTIMATED_VALUE:
        if (!formData.estimatedValue) {
          newErrors.estimatedValue = 'Por favor, selecione o valor estimado.';
        }
        break;
        
      case WizardStep.CONTACT_TIMING:
        if (!formData.contactTiming) {
          newErrors.contactTiming = 'Por favor, selecione quando pretende ser contactado.';
        }
        break;
        
      case WizardStep.LEAD_CAPTURE:
        // Phone is required - validate Portuguese phone format
        if (!formData.phone) {
          newErrors.phone = 'O número de telefone é obrigatório.';
        } else {
          // Clean phone number and validate
          const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
          // Accept Portuguese formats: 9XXXXXXXX, +351XXXXXXXXX, 00351XXXXXXXXX
          const phoneRegex = /^(\+351|00351)?[9][0-9]{8}$/;
          const landlineRegex = /^(\+351|00351)?[2][0-9]{8}$/;
          if (!phoneRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
            newErrors.phone = 'Por favor, introduza um número de telefone válido.';
          }
        }
        // Email is optional but must be valid if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Por favor, introduza um endereço de email válido.';
        }
        break;
    }
    
    return newErrors;
  }, [formData]);

  /**
   * Validates current step and updates error state
   * Returns true if valid, false otherwise
   */
  const validateCurrentStep = useCallback((): boolean => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, validateStep]);

  /**
   * Checks if current step can proceed (has required data)
   * Used for enabling/disabling next button
   */
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case WizardStep.PROPERTY_TYPE:
        return !!formData.propertyType;
      case WizardStep.LOCATION:
        return !!formData.district && !!formData.municipality;
      case WizardStep.SELLING_STAGE:
        return !!formData.sellingStage;
      case WizardStep.ESTIMATED_VALUE:
        return !!formData.estimatedValue;
      case WizardStep.CONTACT_TIMING:
        return !!formData.contactTiming;
      case WizardStep.LEAD_CAPTURE:
        // Phone is required, validate format
        const cleanPhone = formData.phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
        const phoneRegex = /^(\+351|00351)?[9][0-9]{8}$/;
        const landlineRegex = /^(\+351|00351)?[2][0-9]{8}$/;
        return phoneRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
      default:
        return false;
    }
  }, [currentStep, formData]);

  // ---------------------------------------------------------------------------
  // NAVIGATION HANDLERS
  // ---------------------------------------------------------------------------
  
  /**
   * Navigate to next step with validation
   * For card-click steps, auto-advances after selection
   */
  const goToNextStep = useCallback(() => {
    if (currentStep >= WizardStep.LEAD_CAPTURE) return;
    
    // Validate before proceeding
    if (!validateCurrentStep()) return;
    
    setCurrentStep(prev => prev + 1);
    setErrors({}); // Clear errors when moving forward
  }, [currentStep, validateCurrentStep]);

  /**
   * Navigate to previous step
   * Clears errors when going back
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStep <= WizardStep.PROPERTY_TYPE) return;
    
    setCurrentStep(prev => prev - 1);
    setErrors({}); // Clear errors when going back
  }, [currentStep]);

  /**
   * Handle option selection for card-based steps
   * Auto-advances to next step after selection
   */
  const handleOptionSelect = useCallback((field: keyof WizardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors({}); // Clear any errors
    
    // Auto-advance for single-select card steps
    if (currentStep !== WizardStep.LOCATION && currentStep !== WizardStep.LEAD_CAPTURE) {
      // Small delay for visual feedback before advancing
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 150);
    }
  }, [currentStep]);

  // ---------------------------------------------------------------------------
  // FORM FIELD HANDLERS
  // ---------------------------------------------------------------------------
  
  /**
   * Update a form field value
   * Clears related errors when field is updated
   */
  const updateFormField = useCallback((field: keyof WizardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user updates it
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Reset wizard to initial state
   * Useful for "start over" functionality
   */
  const resetWizard = useCallback(() => {
    setCurrentStep(WizardStep.PROPERTY_TYPE);
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
  }, []);

  /**
   * Submit lead to API
   * Creates seller lead in CRM with all quiz answers
   */
  const handleSubmit = useCallback(async () => {
    // Final validation before submit
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/leads/sell-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyType: formData.propertyType,
          district: formData.district,
          municipality: formData.municipality,
          sellingStage: formData.sellingStage,
          estimatedValue: formData.estimatedValue,
          contactTiming: formData.contactTiming,
          phone: formData.phone,
          name: formData.name || undefined,
          email: formData.email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from API
        if (data.errors) {
          setErrors(data.errors);
          setIsSubmitting(false);
          return;
        }

        // Handle other errors
        throw new Error(data.error || 'Erro ao enviar o pedido');
      }

      // Success!
      setIsSuccess(true);
      setCurrentStep(WizardStep.SUCCESS);
    } catch (error) {
      console.error('Error submitting lead:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Erro ao enviar o pedido. Por favor, tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateCurrentStep]);

  // ---------------------------------------------------------------------------
  // RENDER STEP CONTENT
  // ---------------------------------------------------------------------------
  
  const renderStepContent = () => {
    switch (currentStep) {
      case WizardStep.PROPERTY_TYPE:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Distrito
                </Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => {
                    updateFormField('district', value);
                    updateFormField('municipality', ''); // Reset municipality when district changes
                  }}
                >
                  <SelectTrigger
                    id="district"
                    className={`h-12 ${
                      errors.district ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Selecione o distrito" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {PORTUGAL_DISTRICTS.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-sm text-red-500">{errors.district}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Concelho
                </Label>
                <Select
                  value={formData.municipality}
                  onValueChange={(value) => updateFormField('municipality', value)}
                  disabled={!formData.district}
                >
                  <SelectTrigger
                    id="municipality"
                    className={`h-12 ${
                      errors.municipality ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder="Selecione o concelho" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {formData.district &&
                      getMunicipalitiesByDistrict(formData.district).map((municipality) => (
                        <SelectItem key={municipality.value} value={municipality.value}>
                          {municipality.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.municipality && (
                  <p className="text-sm text-red-500">{errors.municipality}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case WizardStep.SELLING_STAGE:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {SELLING_STAGE_OPTIONS.map((option) => {
                const isSelected = formData.sellingStage === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('sellingStage', option.value)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                      isSelected
                        ? 'border-foreground bg-secondary shadow-md'
                        : 'border-border hover:border-foreground/50 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-base ${
                        isSelected ? 'text-foreground' : 'text-foreground'
                      }`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 ml-3"
                        >
                          <CheckCircle2 className="h-4 w-4 text-background" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            {errors.sellingStage && (
              <p className="text-sm text-red-500 text-center">{errors.sellingStage}</p>
            )}
          </div>
        );
      
      case WizardStep.ESTIMATED_VALUE:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {ESTIMATED_VALUE_OPTIONS.map((option) => {
                const isSelected = formData.estimatedValue === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('estimatedValue', option.value)}
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
                          <Euro className="h-5 w-5" />
                        </div>
                        <span className={`font-medium text-base ${
                          isSelected ? 'text-foreground' : 'text-foreground'
                        }`}>
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
            {errors.estimatedValue && (
              <p className="text-sm text-red-500 text-center">{errors.estimatedValue}</p>
            )}
          </div>
        );
      
      case WizardStep.CONTACT_TIMING:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {CONTACT_TIMING_OPTIONS.map((option) => {
                const isSelected = formData.contactTiming === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('contactTiming', option.value)}
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
                          <Clock className="h-5 w-5" />
                        </div>
                        <span className={`font-medium text-base ${
                          isSelected ? 'text-foreground' : 'text-foreground'
                        }`}>
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
            {errors.contactTiming && (
              <p className="text-sm text-red-500 text-center">{errors.contactTiming}</p>
            )}
          </div>
        );
      
      case WizardStep.LEAD_CAPTURE:
        return (
          <div className="space-y-6">
            <div className="space-y-5">
              {/* Phone Number - Required */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de telefone <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={formData.phone}
                    onChange={(e) => updateFormField('phone', e.target.value)}
                    className={`h-12 pl-11 ${
                      errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Name - Optional */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome (opcional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="O seu nome"
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Email - Optional */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email (opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => updateFormField('email', e.target.value)}
                  className={`h-12 ${
                    errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Trust Microcopy */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Os seus dados são utilizados exclusivamente para este contacto.
                  Um consultor da Covialvi entrará em contacto consigo.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
                className="flex-1"
              >
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
                    Receber contacto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Submit Error Display */}
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
              Pedido recebido com sucesso
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Entraremos em contacto consigo brevemente.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 max-w-md mx-auto mb-8"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                A sua avaliação será preparada por um dos nossos consultores especializados. 
                Receberá o contacto no número fornecido nas próximas 24 horas.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Quer uma avaliação mais detalhada e precisa?
              </p>
              <Button
                asChild
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8"
              >
                <a href="/avaliacao-completa">
                  Avaliação Completa
                  <ArrowRight className="ml-2 h-4 w-4" />
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
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Descubra quanto pode valer o seu imóvel
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Responda a algumas perguntas rápidas e receba uma avaliação gratuita e sem compromisso.
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

        {/* Trust Microcopy */}
        {!isSuccessStep && currentStep !== WizardStep.LEAD_CAPTURE && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
          >
            Os seus dados são utilizados exclusivamente para este contacto.
          </motion.p>
        )}
      </div>
    </section>
  );
}

export default SellPropertyWizard;
