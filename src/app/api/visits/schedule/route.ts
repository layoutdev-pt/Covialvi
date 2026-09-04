import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { propertyId, scheduledAt, notes, visitorName, visitorEmail, visitorPhone, website } = await request.json();
    
    // Honeypot validation
    if (website) {
      console.log('Honeypot triggered in visit schedule API. Aborting silently.');
      return NextResponse.json({ success: true });
    }

    if (!propertyId || !scheduledAt) {
      return NextResponse.json({ error: 'Property ID and scheduled time required' }, { status: 400 });
    }

    if (!user && (!visitorName || !visitorEmail || !visitorPhone)) {
      return NextResponse.json({ error: 'Name, email and phone are required for guest visits' }, { status: 400 });
    }

    // Strict email validation
    if (visitorEmail && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(visitorEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { error } = await supabase.from('visits').insert({
      property_id: propertyId,
      user_id: user?.id || null,
      scheduled_at: scheduledAt,
      notes: notes || null,
      status: 'pending',
      visitor_name: visitorName || null,
      visitor_email: visitorEmail || null,
      visitor_phone: visitorPhone || null,
    });

    if (error) {
      console.error('[API Visits] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch property title for email
    let propertyTitle = 'Imóvel';
    let propertyAddress = '';
    try {
      const { data: property } = await supabase
        .from('properties')
        .select('title, address, municipality, district')
        .eq('id', propertyId)
        .single();
      if (property) {
        propertyTitle = property.title || propertyTitle;
        const parts = [property.address, property.municipality, property.district].filter(Boolean);
        propertyAddress = parts.join(', ');
      }
    } catch {}

    const clientName = visitorName || user?.email?.split('@')[0] || 'Cliente';
    const clientEmail = visitorEmail || user?.email || null;
    const clientPhone = visitorPhone || '';

    // Format date/time for emails
    const scheduledDate = new Date(scheduledAt);
    const visitDate = scheduledDate.toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const visitTime = scheduledDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

    const adminEmail = process.env.ADMIN_EMAIL || 'covialvi@gmail.com';

    // Email to admin
    try {
      await sendEmail({
        to: adminEmail,
        subject: `📅 Nova Visita Agendada: ${propertyTitle} — ${clientName}`,
        html: `
          <!DOCTYPE html><html><head><meta charset="utf-8"></head>
          <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f5f5f5;">
          <div style="max-width:600px;margin:0 auto;background:#fff;">
            <div style="background:#0a0a0a;padding:30px;text-align:center;">
              <h1 style="color:#eab308;margin:0;font-size:28px;">Covialvi</h1>
              <p style="color:#888;margin:10px 0 0;font-size:14px;">Nova Visita Agendada</p>
            </div>
            <div style="padding:40px 30px;">
              <h2 style="color:#0a0a0a;margin:0 0 20px;font-size:22px;">Pedido de Visita</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;width:130px;">Imóvel:</td><td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:600;">${propertyTitle}</td></tr>
                ${propertyAddress ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;">Morada:</td><td style="padding:12px 0;border-bottom:1px solid #eee;">${propertyAddress}</td></tr>` : ''}
                <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;">Cliente:</td><td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:600;">${clientName}</td></tr>
                ${clientEmail ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;">Email:</td><td style="padding:12px 0;border-bottom:1px solid #eee;"><a href="mailto:${clientEmail}" style="color:#eab308;">${clientEmail}</a></td></tr>` : ''}
                ${clientPhone ? `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;">Telefone:</td><td style="padding:12px 0;border-bottom:1px solid #eee;"><a href="tel:${clientPhone}" style="color:#eab308;">${clientPhone}</a></td></tr>` : ''}
                <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;">Data:</td><td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:600;">${visitDate}</td></tr>
                <tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#666;">Hora:</td><td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:600;">${visitTime}</td></tr>
                ${notes ? `<tr><td style="padding:12px 0;color:#666;">Notas:</td><td style="padding:12px 0;">${notes}</td></tr>` : ''}
              </table>
              ${clientEmail ? `<div style="margin-top:30px;text-align:center;"><a href="mailto:${clientEmail}" style="display:inline-block;background:#eab308;color:#0a0a0a;padding:14px 30px;text-decoration:none;border-radius:50px;font-weight:600;">Contactar Cliente</a></div>` : ''}
            </div>
            <div style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
              <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} Covialvi - Construções, Lda.</p>
            </div>
          </div></body></html>`,
        replyTo: clientEmail || undefined,
      });
    } catch (emailErr) {
      console.error('[API Visits] Admin email error:', emailErr);
    }

    // Confirmation email to client
    if (clientEmail) {
      try {
        await sendEmail({
          to: clientEmail,
          subject: `Visita Agendada: ${propertyTitle} — ${visitDate}`,
          html: `
            <!DOCTYPE html><html><head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f5f5f5;">
            <div style="max-width:600px;margin:0 auto;background:#fff;">
              <div style="background:#0a0a0a;padding:30px;text-align:center;">
                <h1 style="color:#eab308;margin:0;font-size:28px;">Covialvi</h1>
                <p style="color:#888;margin:10px 0 0;font-size:14px;">Confirmação de Visita</p>
              </div>
              <div style="padding:40px 30px;">
                <h2 style="color:#0a0a0a;margin:0 0 10px;font-size:22px;">Olá ${clientName}!</h2>
                <p style="color:#666;margin:0 0 30px;line-height:1.6;">O seu pedido de visita foi recebido. Entraremos em contacto para confirmar o agendamento.</p>
                <div style="background:#fef9c3;border-radius:12px;padding:25px;margin-bottom:25px;">
                  <p style="margin:0 0 8px;color:#854d0e;font-size:16px;font-weight:600;">📅 ${visitDate}</p>
                  <p style="margin:0;color:#a16207;font-size:24px;font-weight:700;">${visitTime}</p>
                </div>
                <div style="background:#f9fafb;border-radius:12px;padding:25px;margin-bottom:25px;">
                  <h3 style="color:#0a0a0a;margin:0 0 10px;font-size:16px;">Imóvel a Visitar</h3>
                  <p style="color:#0a0a0a;margin:0 0 6px;font-size:18px;font-weight:600;">${propertyTitle}</p>
                  ${propertyAddress ? `<p style="color:#666;margin:0;font-size:14px;">📍 ${propertyAddress}</p>` : ''}
                </div>
                <div style="background:#fef3c7;border-radius:8px;padding:20px;margin-bottom:25px;">
                  <p style="color:#92400e;margin:0;font-size:14px;"><strong>⚠️ Importante:</strong> Esta é uma confirmação do seu pedido. Entraremos em contacto para confirmar a disponibilidade.</p>
                </div>
                <div style="border-radius:8px;padding:20px;background:#f9fafb;">
                  <p style="color:#666;margin:0 0 8px;font-size:14px;">Para reagendar ou cancelar, contacte-nos:</p>
                  <p style="margin:0 0 6px;color:#0a0a0a;">📞 <a href="tel:+351275971394" style="color:#eab308;text-decoration:none;">+351 275 971 394</a></p>
                  <p style="margin:0;color:#0a0a0a;">📱 <a href="tel:+351967138116" style="color:#eab308;text-decoration:none;">+351 967 138 116</a></p>
                </div>
              </div>
              <div style="background:#f9fafb;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
                <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} Covialvi - Construções, Lda.</p>
              </div>
            </div></body></html>`,
        });
      } catch (emailErr) {
        console.error('[API Visits] Client email error:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Visits] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
