import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendVisitConfirmation } from '@/lib/email';
import { company } from '@/lib/company';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId } = body;

    if (!visitId) {
      return NextResponse.json(
        { error: 'Visit ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Fetch visit with related data
    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select(`
        *,
        leads (name, email, phone),
        properties (title, address, municipality, district)
      `)
      .eq('id', visitId)
      .single();

    if (visitError || !visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    // Update visit status to confirmed
    const { error: updateError } = await supabase
      .from('visits')
      .update({ status: 'confirmed' })
      .eq('id', visitId);

    if (updateError) {
      console.error('Visit update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update visit status' },
        { status: 500 }
      );
    }

    // Format date and time
    const visitDate = new Date(visit.scheduled_at);
    const formattedDate = visitDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = visitDate.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Build address
    const propertyAddress = [
      visit.properties?.address,
      visit.properties?.municipality,
      visit.properties?.district,
    ].filter(Boolean).join(', ') || 'Portugal';

    // Send confirmation email to client
    if (visit.leads?.email) {
      const emailResult = await sendVisitConfirmation({
        clientEmail: visit.leads.email,
        clientName: visit.leads.name || 'Cliente',
        propertyTitle: visit.properties?.title || 'Imóvel',
        propertyAddress,
        visitDate: formattedDate,
        visitTime: formattedTime,
        agentName: 'Equipa Covialvi',
        agentPhone: company.phone,
      });

      if (!emailResult.success) {
        console.error('Visit confirmation email failed:', emailResult.error);
      }
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      action: 'status_change',
      entity_type: 'visit',
      entity_id: visitId,
      old_values: { status: visit.status },
      new_values: { status: 'confirmed' },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    return NextResponse.json({
      success: true,
      message: 'Visita confirmada e email enviado ao cliente.',
    });

  } catch (error) {
    console.error('Visit confirmation error:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar visita' },
      { status: 500 }
    );
  }
}
