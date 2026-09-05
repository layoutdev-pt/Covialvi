import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getDistrictLabel, getMunicipalityLabel } from '@/lib/portugal-locations';
import { sendEmail } from '@/lib/email';
import { getSellPropertyEmailTemplate } from '@/lib/sell-property-email-template';
import { verifyRealEmail } from '@/lib/email-validator';
import { verifyOtpToken } from '@/lib/otp-token';

/**
 * API Route: POST /api/leads/sell-property
 * 
 * Purpose: Create a seller lead from the homepage wizard
 * 
 * This is a critical conversion endpoint that:
 * 1. Validates and sanitizes all wizard data
 * 2. Creates a lead record in the database
 * 3. Stores all quiz answers in custom_fields
 * 4. Sets lead_type = 'seller' and source = 'homepage_sell_wizard'
 * 5. Creates audit log entry
 * 6. Triggers admin notification (future: email/webhook)
 * 
 * Security: Rate-limited, validates all inputs, uses service client
 */

interface SellPropertyLeadRequest {
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
  
  // Step 6: Contact Details
  phone: string;
  name?: string;
  email?: string;
  otpToken?: string;
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
  
  // Ensure it starts with +351
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
 * POST handler - Create seller lead
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SellPropertyLeadRequest = await request.json();

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

    // Honeypot check for spam prevention
    if (body.website) {
      return NextResponse.json({
        success: true,
        message: 'Pedido recebido com sucesso',
      });
    }

    const errors: Record<string, string> = {};

    // Validate required fields
    if (!body.propertyType) errors.propertyType = 'Tipo de imóvel é obrigatório';
    if (!body.district) errors.district = 'Distrito é obrigatório';
    if (!body.municipality) errors.municipality = 'Concelho é obrigatório';
    if (!body.sellingStage) errors.sellingStage = 'Fase de venda é obrigatória';
    if (!body.estimatedValue) errors.estimatedValue = 'Valor estimado é obrigatório';
    if (!body.contactTiming) errors.contactTiming = 'Preferência de contacto é obrigatória';
    if (!body.phone) errors.phone = 'Número de telefone é obrigatório';

    // Validate phone format
    if (body.phone && !validatePhone(body.phone)) {
      errors.phone = 'Número de telefone inválido';
    }

    // Validate email format, authenticity, and OTP if provided
    if (body.email && body.email.trim()) {
      if (!validateEmail(body.email)) {
        errors.email = 'Endereço de email inválido';
      } else {
        const isRealEmail = await verifyRealEmail(body.email);
        if (!isRealEmail) {
          errors.email = 'Endereço de e-mail inválido ou não existe. Por favor, utilize um e-mail real.';
        } else if (body.otpToken) {
          const isValidOtp = verifyOtpToken(body.otpToken, body.email, 'evaluation');
          if (!isValidOtp) {
            errors.email = 'Sessão de verificação de código inválida ou expirada.';
          }
        }
      }
    }

    // Return validation errors
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

    // Build custom_fields with all quiz answers
    const customFields = {
      lead_type: 'seller',
      wizard_source: 'homepage_sell_wizard',
      quiz_answers: {
        property_type: body.propertyType,
        district: body.district,
        district_label: getDistrictLabel(body.district),
        municipality: body.municipality,
        municipality_label: getMunicipalityLabel(body.district, body.municipality),
        selling_stage: body.sellingStage,
        estimated_value: body.estimatedValue,
        contact_timing: body.contactTiming,
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

    // Create lead record
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        email: body.email || `seller_${Date.now()}@temp.covialvi.com`, // Email required in schema
        first_name: body.name || null,
        phone: sanitizedPhone,
        source: 'homepage_sell_wizard',
        status: 'new',
        message: `Proprietário interessado em vender ${body.propertyType} em ${getMunicipalityLabel(body.district, body.municipality)}`,
        tags: ['seller', 'homepage_wizard', body.sellingStage],
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
    // CREATE AUDIT LOG
    // -------------------------------------------------------------------------

    await supabase.from('audit_logs').insert({
      table_name: 'leads',
      record_id: lead.id,
      action: 'insert',
      changes: {
        source: 'homepage_sell_wizard',
        lead_type: 'seller',
        property_type: body.propertyType,
        location: `${body.district}/${body.municipality}`,
      },
      ip_address: clientIp,
      user_agent: userAgent,
    });

    // -------------------------------------------------------------------------
    // CREATE IN-APP NOTIFICATION FOR ADMINS
    // -------------------------------------------------------------------------

    // Get all admin users to notify
    const { data: adminUsers } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .eq('is_active', true);

    if (adminUsers && adminUsers.length > 0) {
      // Create notification for each admin
      const notifications = adminUsers.map((admin: { id: string }) => ({
        user_id: admin.id,
        type: 'lead' as const,
        title: 'Novo Lead — Venda de Imóvel',
        message: `${body.name || 'Proprietário'} quer vender ${body.propertyType} em ${getMunicipalityLabel(body.district, body.municipality)}. Fase: ${body.sellingStage}`,
        link: `/admin/crm`,
        read: false,
        metadata: {
          lead_id: lead.id,
          lead_type: 'seller',
          source: 'homepage_sell_wizard',
          property_type: body.propertyType,
          location: `${body.district}/${body.municipality}`,
        },
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // -------------------------------------------------------------------------
    // SEND EMAIL NOTIFICATION
    // -------------------------------------------------------------------------

    try {
      const emailHTML = getSellPropertyEmailTemplate({
        name: body.name,
        email: body.email,
        phone: sanitizedPhone,
        propertyType: body.propertyType,
        district: body.district,
        municipality: body.municipality,
        districtLabel: getDistrictLabel(body.district),
        municipalityLabel: getMunicipalityLabel(body.district, body.municipality),
        sellingStage: body.sellingStage,
        estimatedValue: body.estimatedValue,
        contactTiming: body.contactTiming,
        leadId: lead.id,
        submittedAt: new Date().toLocaleString('pt-PT', {
          dateStyle: 'full',
          timeStyle: 'short'
        }),
      });

      const isUrgent = body.sellingStage === 'urgent';
      const emailSubject = isUrgent
        ? `🏡 URGENTE: Avaliação ${body.propertyType} - ${body.name || 'Cliente'} ⚡`
        : `🏡 Nova Avaliação: ${body.propertyType} em ${getMunicipalityLabel(body.district, body.municipality)}`;

      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'covialvi@gmail.com',
        subject: emailSubject,
        html: emailHTML,
        replyTo: body.email,
      });
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails - lead is still saved
    }

    // -------------------------------------------------------------------------
    // RETURN SUCCESS
    // -------------------------------------------------------------------------

    return NextResponse.json({
      success: true,
      message: 'Pedido recebido com sucesso',
      leadId: lead.id,
    });
  } catch (error) {
    console.error('Unexpected error in sell-property API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
