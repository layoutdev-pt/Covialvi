import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getDistrictLabel, getMunicipalityLabel } from '@/lib/portugal-locations';

/**
 * API Route: POST /api/leads/complete-evaluation
 * 
 * Purpose: Create a seller lead from the complete property evaluation wizard
 */

interface CompleteEvaluationRequest {
  // Property Type
  propertyType: string;
  
  // Location
  district: string;
  municipality: string;
  parish?: string;
  address?: string;
  postalCode?: string;
  
  // Property Details
  bedrooms?: string;
  bathrooms?: string;
  grossArea?: string;
  usefulArea?: string;
  plotArea?: string;
  floor?: string;
  yearBuilt?: string;
  
  // Features
  features?: string[];
  
  // Condition
  condition: string;
  lastRenovation?: string;
  renovationDetails?: string;
  
  // Selling Info
  sellingStage: string;
  estimatedValue?: string;
  currentlyRented?: string;
  monthlyRent?: string;
  
  // Contact
  name: string;
  email: string;
  phone: string;
  preferredContact?: string;
  additionalNotes?: string;
}

/**
 * Validate phone number format (Portuguese)
 */
function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  const mobileRegex = /^(\+351|00351)?[9][0-9]{8}$/;
  const landlineRegex = /^(\+351|00351)?[2][0-9]{8}$/;
  return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Sanitize phone number to standard format
 */
function sanitizePhone(phone: string): string {
  let clean = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (clean.startsWith('00351')) {
    clean = '+351' + clean.substring(5);
  } else if (!clean.startsWith('+351') && !clean.startsWith('+')) {
    clean = '+351' + clean;
  }
  
  return clean;
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    null
  );
}

/**
 * POST handler - Create complete evaluation lead
 */
export async function POST(request: NextRequest) {
  try {
    const body: CompleteEvaluationRequest = await request.json();

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    const errors: Record<string, string> = {};

    if (!body.propertyType) errors.propertyType = 'Tipo de imóvel é obrigatório';
    if (!body.district) errors.district = 'Distrito é obrigatório';
    if (!body.municipality) errors.municipality = 'Concelho é obrigatório';
    if (!body.condition) errors.condition = 'Estado do imóvel é obrigatório';
    if (!body.sellingStage) errors.sellingStage = 'Fase de venda é obrigatória';
    if (!body.name) errors.name = 'Nome é obrigatório';
    if (!body.email) errors.email = 'Email é obrigatório';
    if (!body.phone) errors.phone = 'Telefone é obrigatório';

    if (body.phone && !validatePhone(body.phone)) {
      errors.phone = 'Número de telefone inválido';
    }

    if (body.email && !validateEmail(body.email)) {
      errors.email = 'Endereço de email inválido';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // PREPARE DATA
    // -------------------------------------------------------------------------

    const sanitizedPhone = sanitizePhone(body.phone);
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || null;

    const customFields = {
      lead_type: 'seller',
      wizard_source: 'complete_evaluation',
      property_details: {
        property_type: body.propertyType,
        district: body.district,
        district_label: getDistrictLabel(body.district),
        municipality: body.municipality,
        municipality_label: getMunicipalityLabel(body.district, body.municipality),
        parish: body.parish || null,
        address: body.address || null,
        postal_code: body.postalCode || null,
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        gross_area: body.grossArea || null,
        useful_area: body.usefulArea || null,
        plot_area: body.plotArea || null,
        floor: body.floor || null,
        year_built: body.yearBuilt || null,
        features: body.features || [],
        condition: body.condition,
        last_renovation: body.lastRenovation || null,
        renovation_details: body.renovationDetails || null,
      },
      selling_info: {
        selling_stage: body.sellingStage,
        estimated_value: body.estimatedValue || null,
        currently_rented: body.currentlyRented || null,
        monthly_rent: body.monthlyRent || null,
      },
      contact_preferences: {
        preferred_contact: body.preferredContact || null,
        additional_notes: body.additionalNotes || null,
      },
      submitted_at: new Date().toISOString(),
    };

    // -------------------------------------------------------------------------
    // CREATE LEAD IN DATABASE
    // -------------------------------------------------------------------------

    const supabase = createServiceClient();

    // Check for duplicate lead (same phone in last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, created_at')
      .eq('phone', sanitizedPhone)
      .gte('created_at', twentyFourHoursAgo)
      .single();

    if (existingLead) {
      return NextResponse.json(
        {
          success: false,
          error: 'Já recebemos o seu pedido recentemente. Entraremos em contacto em breve.',
        },
        { status: 409 }
      );
    }

    const locationLabel = getMunicipalityLabel(body.district, body.municipality);
    
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        email: body.email,
        first_name: body.name,
        phone: sanitizedPhone,
        source: 'complete_evaluation',
        status: 'new',
        message: `Avaliação completa: ${body.propertyType} em ${locationLabel}. Estado: ${body.condition}. Fase: ${body.sellingStage}`,
        tags: ['seller', 'complete_evaluation', body.condition, body.sellingStage],
        custom_fields: customFields,
        ip_address: clientIp,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return NextResponse.json(
        { success: false, error: 'Erro ao processar o pedido. Por favor, tente novamente.' },
        { status: 500 }
      );
    }

    // -------------------------------------------------------------------------
    // CREATE IN-APP NOTIFICATION FOR ADMINS
    // -------------------------------------------------------------------------

    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .eq('is_active', true);

    if (adminUsers && adminUsers.length > 0) {
      const notifications = adminUsers.map((admin: { id: string }) => ({
        user_id: admin.id,
        type: 'lead' as const,
        title: 'Nova Avaliação Completa',
        message: `${body.name} pediu avaliação de ${body.propertyType} em ${locationLabel}`,
        link: `/admin/crm`,
        read: false,
        metadata: {
          lead_id: lead.id,
          lead_type: 'seller',
          source: 'complete_evaluation',
          property_type: body.propertyType,
          location: `${body.district}/${body.municipality}`,
        },
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // -------------------------------------------------------------------------
    // RETURN SUCCESS
    // -------------------------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: 'Pedido de avaliação recebido com sucesso',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Unexpected error in complete-evaluation API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
