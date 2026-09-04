import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getDistrictLabel, getMunicipalityLabel } from '@/lib/portugal-locations';
import { sendEmail } from '@/lib/email';

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
  
  // Honeypot field (hidden from humans, filled by bots)
  website?: string;
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
 * Validate email format (strict validation)
 */
function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
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
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: CompleteEvaluationRequest = await request.json();

    // -------------------------------------------------------------------------
    // HONEYPOT CHECK & VALIDATION
    // -------------------------------------------------------------------------

    // Honeypot validation: if the hidden 'website' field is filled, it's a bot.
    // Return early with success to trick the bot.
    if (body.website) {
      console.log('Honeypot triggered in complete evaluation API. Aborting silently.');
      return NextResponse.json(
        { success: true, message: 'Pedido de avaliação recebido com sucesso' },
        { status: 200 }
      );
    }

    const errors: Record<string, string> = {};

    if (!body.propertyType) errors.propertyType = 'Tipo de imóvel é obrigatório';
    if (!body.district) errors.district = 'Distrito é obrigatório';
    if (!body.municipality) errors.municipality = 'Concelho é obrigatório';
    if (!body.condition) errors.condition = 'Estado do imóvel é obrigatório';
    if (!body.sellingStage) errors.sellingStage = 'Fase de venda é obrigatória';
    if (!body.name) errors.name = 'Nome é obrigatório';
    if (!body.phone) errors.phone = 'Telefone é obrigatório';

    if (body.phone && !validatePhone(body.phone)) {
      errors.phone = 'Número de telefone inválido';
    }

    if (body.email && body.email.trim() && !validateEmail(body.email)) {
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
        email: body.email || `eval_${Date.now()}@temp.covialvi.com`,
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
    // SEND EMAIL NOTIFICATION TO ADMIN
    // -------------------------------------------------------------------------

    try {
      const locationLabel = getMunicipalityLabel(body.district, body.municipality);
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'covialvi@gmail.com',
        subject: `Nova Avaliação Completa: ${body.propertyType} em ${locationLabel} — ${body.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0a0a0a;padding:24px;text-align:center;"><h1 style="color:#eab308;margin:0;">Covialvi</h1><p style="color:#888;margin:8px 0 0;">Nova Avaliação de Imóvel</p></div>
            <div style="padding:32px 24px;">
              <h2 style="margin:0 0 20px;">Pedido de Avaliação Completa</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:140px;">Nome:</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:500;">${body.name}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Telefone:</td><td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="tel:${sanitizedPhone}" style="color:#eab308;">${sanitizedPhone}</a></td></tr>
                ${body.email ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Email:</td><td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="mailto:${body.email}" style="color:#eab308;">${body.email}</a></td></tr>` : ''}
                <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Tipo Imóvel:</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${body.propertyType}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Localização:</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${locationLabel}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Estado:</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${body.condition}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Fase Venda:</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${body.sellingStage}</td></tr>
                ${body.estimatedValue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Valor Est.:</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${body.estimatedValue}</td></tr>` : ''}
                ${body.additionalNotes ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Notas:</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${body.additionalNotes}</td></tr>` : ''}
              </table>
              <div style="margin-top:24px;text-align:center;"><a href="mailto:${body.email || ''}" style="background:#eab308;color:#0a0a0a;padding:12px 28px;text-decoration:none;border-radius:50px;font-weight:600;display:inline-block;">Responder ao Cliente</a></div>
            </div>
          </div>`,
        replyTo: body.email,
      });
    } catch (emailError) {
      console.error('Error sending evaluation email:', emailError);
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
