import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { notifyNewLead } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, propertyId, propertyTitle, propertyRef } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Save lead to database
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone: phone || null,
        message: message || null,
        property_id: propertyId || null,
        source: propertyId ? 'property_page' : 'contact_page',
        status: 'new',
      })
      .select()
      .single();

    if (leadError) {
      console.error('Lead save error:', leadError);
      // Continue even if lead save fails - still send email
    }

    // Send email notification to admin
    const emailResult = await notifyNewLead({
      name,
      email,
      phone,
      message,
      propertyTitle,
      propertyRef,
    });

    if (!emailResult.success) {
      console.error('Email notification failed:', emailResult.error);
      // Don't fail the request if email fails
    }

    // Log audit
    if (lead) {
      await supabase.from('audit_logs').insert({
        action: 'create',
        entity_type: 'lead',
        entity_id: lead.id,
        new_values: { name, email, source: propertyId ? 'property_page' : 'contact_page' },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contacto brevemente.',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o pedido. Por favor tente novamente.' },
      { status: 500 }
    );
  }
}
