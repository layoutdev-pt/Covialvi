import { Resend } from 'resend';

let resend: Resend | null = null;

// Only initialize Resend if API key is available
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = 'Covialvi <noreply@covialvi.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'covialvi@gmail.com';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions) {
  // Check if Resend is available
  if (!resend) {
    console.log('Email service not configured - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error };
  }
}

// Email Templates

export function newLeadEmailTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyTitle?: string;
  propertyRef?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #0a0a0a; padding: 30px; text-align: center;">
          <h1 style="color: #eab308; margin: 0; font-size: 28px;">Covialvi</h1>
          <p style="color: #888; margin: 10px 0 0 0; font-size: 14px;">Novo Contacto Recebido</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0a0a0a; margin: 0 0 20px 0; font-size: 22px;">Novo Pedido de Contacto</h2>
          
          ${data.propertyTitle ? `
          <div style="background-color: #fef9c3; border-left: 4px solid #eab308; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #854d0e; font-size: 14px;">
              <strong>Imóvel:</strong> ${data.propertyTitle}<br>
              ${data.propertyRef ? `<strong>Ref:</strong> ${data.propertyRef}` : ''}
            </p>
          </div>
          ` : ''}
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; width: 120px;">Nome:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #0a0a0a; font-weight: 500;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Email:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #0a0a0a;">
                <a href="mailto:${data.email}" style="color: #eab308;">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Telefone:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #0a0a0a;">
                <a href="tel:${data.phone}" style="color: #eab308;">${data.phone}</a>
              </td>
            </tr>
            ` : ''}
          </table>
          
          ${data.message ? `
          <div style="margin-top: 25px;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Mensagem:</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; color: #374151;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${data.email}" style="display: inline-block; background-color: #eab308; color: #0a0a0a; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: 600;">
              Responder ao Contacto
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Covialvi - Construções, Lda. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function visitConfirmationEmailTemplate(data: {
  clientName: string;
  propertyTitle: string;
  propertyAddress: string;
  visitDate: string;
  visitTime: string;
  agentName?: string;
  agentPhone?: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #0a0a0a; padding: 30px; text-align: center;">
          <h1 style="color: #eab308; margin: 0; font-size: 28px;">Covialvi</h1>
          <p style="color: #888; margin: 10px 0 0 0; font-size: 14px;">Confirmação de Visita</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0a0a0a; margin: 0 0 10px 0; font-size: 22px;">Olá ${data.clientName}!</h2>
          <p style="color: #666; margin: 0 0 30px 0;">A sua visita foi confirmada com sucesso.</p>
          
          <!-- Visit Card -->
          <div style="background-color: #fef9c3; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 32px; margin-right: 15px;">📅</span>
              <div>
                <p style="margin: 0; color: #854d0e; font-size: 18px; font-weight: 600;">${data.visitDate}</p>
                <p style="margin: 5px 0 0 0; color: #a16207; font-size: 24px; font-weight: 700;">${data.visitTime}</p>
              </div>
            </div>
          </div>
          
          <!-- Property Info -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #0a0a0a; margin: 0 0 15px 0; font-size: 16px;">Imóvel a Visitar</h3>
            <p style="color: #0a0a0a; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">${data.propertyTitle}</p>
            <p style="color: #666; margin: 0; font-size: 14px;">
              📍 ${data.propertyAddress}
            </p>
          </div>
          
          ${data.agentName ? `
          <!-- Agent Info -->
          <div style="border: 1px solid #eee; border-radius: 12px; padding: 20px;">
            <h3 style="color: #0a0a0a; margin: 0 0 15px 0; font-size: 16px;">O seu Consultor</h3>
            <p style="color: #0a0a0a; margin: 0; font-weight: 600;">${data.agentName}</p>
            ${data.agentPhone ? `<p style="color: #eab308; margin: 5px 0 0 0;"><a href="tel:${data.agentPhone}" style="color: #eab308; text-decoration: none;">${data.agentPhone}</a></p>` : ''}
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>⚠️ Importante:</strong> Se precisar de reagendar ou cancelar a visita, por favor contacte-nos com antecedência.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Covialvi - Construções, Lda.<br>
            +351 967 138 116 | covialvi@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function propertyAlertEmailTemplate(data: {
  userName: string;
  properties: Array<{
    title: string;
    price: string;
    location: string;
    slug: string;
    imageUrl?: string;
  }>;
  searchCriteria?: string;
}) {
  const propertyCards = data.properties.map(prop => `
    <div style="border: 1px solid #eee; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      ${prop.imageUrl ? `
      <div style="height: 180px; background-image: url('${prop.imageUrl}'); background-size: cover; background-position: center;"></div>
      ` : ''}
      <div style="padding: 20px;">
        <h3 style="color: #0a0a0a; margin: 0 0 10px 0; font-size: 18px;">${prop.title}</h3>
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">📍 ${prop.location}</p>
        <p style="color: #eab308; margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">${prop.price}</p>
        <a href="https://covialvi.com/imoveis/${prop.slug}" style="display: inline-block; background-color: #0a0a0a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 50px; font-size: 14px;">
          Ver Imóvel →
        </a>
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #0a0a0a; padding: 30px; text-align: center;">
          <h1 style="color: #eab308; margin: 0; font-size: 28px;">Covialvi</h1>
          <p style="color: #888; margin: 10px 0 0 0; font-size: 14px;">Novos Imóveis para Si</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #0a0a0a; margin: 0 0 10px 0; font-size: 22px;">Olá ${data.userName}!</h2>
          <p style="color: #666; margin: 0 0 30px 0;">
            Encontrámos ${data.properties.length} novo${data.properties.length > 1 ? 's' : ''} imóvel${data.properties.length > 1 ? 'is' : ''} que corresponde${data.properties.length > 1 ? 'm' : ''} às suas preferências.
          </p>
          
          ${data.searchCriteria ? `
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              <strong>Critérios:</strong> ${data.searchCriteria}
            </p>
          </div>
          ` : ''}
          
          ${propertyCards}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://covialvi.com/imoveis" style="display: inline-block; background-color: #eab308; color: #0a0a0a; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: 600;">
              Ver Todos os Imóveis
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0 0 10px 0;">
            Recebeu este email porque subscreveu alertas de imóveis.
          </p>
          <a href="https://covialvi.com/conta/alertas" style="color: #eab308; font-size: 12px;">Gerir preferências</a>
          <p style="color: #888; font-size: 12px; margin: 15px 0 0 0;">
            © ${new Date().getFullYear()} Covialvi - Construções, Lda.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send notification to admin for new lead
export async function notifyNewLead(leadData: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyTitle?: string;
  propertyRef?: string;
}) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `Novo Contacto: ${leadData.name}${leadData.propertyTitle ? ` - ${leadData.propertyTitle}` : ''}`,
    html: newLeadEmailTemplate(leadData),
    replyTo: leadData.email,
  });
}

// Send visit confirmation to client
export async function sendVisitConfirmation(visitData: {
  clientEmail: string;
  clientName: string;
  propertyTitle: string;
  propertyAddress: string;
  visitDate: string;
  visitTime: string;
  agentName?: string;
  agentPhone?: string;
}) {
  return sendEmail({
    to: visitData.clientEmail,
    subject: `Visita Confirmada: ${visitData.propertyTitle}`,
    html: visitConfirmationEmailTemplate(visitData),
  });
}

// Send property alerts to user
export async function sendPropertyAlerts(alertData: {
  userEmail: string;
  userName: string;
  properties: Array<{
    title: string;
    price: string;
    location: string;
    slug: string;
    imageUrl?: string;
  }>;
  searchCriteria?: string;
}) {
  return sendEmail({
    to: alertData.userEmail,
    subject: `${alertData.properties.length} Novo${alertData.properties.length > 1 ? 's' : ''} Imóvel${alertData.properties.length > 1 ? 'is' : ''} para Si - Covialvi`,
    html: propertyAlertEmailTemplate(alertData),
  });
}
