import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { verifyRealEmail } from '@/lib/email-validator';

export const dynamic = 'force-dynamic';

const ALLOWED_FORM_TYPES = ['contact', 'property', 'visit', 'evaluation'];
const OTP_TTL_MINUTES = 10;
const MAX_PENDING_PER_EMAIL = 3; // Max OTPs sent in last 10 min per email

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function otpEmailTemplate(code: string, formType: string): string {
  const formLabels: Record<string, string> = {
    contact: 'Pedido de Contacto',
    property: 'Pedido de Informação sobre Imóvel',
    visit: 'Agendamento de Visita',
    evaluation: 'Pedido de Avaliação',
  };
  const formLabel = formLabels[formType] || 'Formulário';

  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f5f5f5;">
      <div style="max-width:480px;margin:0 auto;background:#fff;">
        <div style="background:#0a0a0a;padding:28px;text-align:center;">
          <h1 style="color:#eab308;margin:0;font-size:26px;font-weight:700;">Covialvi</h1>
          <p style="color:#888;margin:8px 0 0;font-size:13px;">Verificação de E-mail</p>
        </div>
        <div style="padding:36px 28px;">
          <h2 style="color:#0a0a0a;margin:0 0 10px;font-size:20px;">O seu código de verificação</h2>
          <p style="color:#555;margin:0 0 28px;line-height:1.6;font-size:14px;">
            Para confirmar o seu <strong>${formLabel}</strong>, introduza o código abaixo no formulário do nosso site.
          </p>
          <div style="background:#fef9c3;border:2px dashed #eab308;border-radius:16px;padding:28px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:#854d0e;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:1px;">Código de Verificação</p>
            <p style="margin:0;color:#0a0a0a;font-size:42px;font-weight:800;letter-spacing:10px;">${code}</p>
          </div>
          <div style="background:#fef3c7;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
              ⏱️ Este código é válido durante <strong>${OTP_TTL_MINUTES} minutos</strong>.<br>
              📁 Se não encontrar este e-mail, verifique a pasta de <strong>spam/lixo</strong>.
            </p>
          </div>
          <p style="color:#888;font-size:12px;margin:0;line-height:1.5;">
            Se não solicitou este código, ignore este e-mail. Nenhuma ação é necessária.
          </p>
        </div>
        <div style="background:#f9fafb;padding:18px 28px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:11px;margin:0;">© ${new Date().getFullYear()} Covialvi - Construções, Lda.</p>
        </div>
      </div>
    </body></html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, formType } = await request.json();

    // Validate inputs
    if (!email || !formType) {
      return NextResponse.json({ error: 'Email e tipo de formulário são obrigatórios.' }, { status: 400 });
    }

    if (!ALLOWED_FORM_TYPES.includes(formType)) {
      return NextResponse.json({ error: 'Tipo de formulário inválido.' }, { status: 400 });
    }

    // Validate email is real (format + blacklist + DNS MX)
    const isRealEmail = await verifyRealEmail(email);
    if (!isRealEmail) {
      return NextResponse.json({ error: 'Endereço de e-mail inválido ou não existe. Por favor, utilize um e-mail real.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Rate limiting: max 3 pending OTPs per email in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - OTP_TTL_MINUTES * 60 * 1000).toISOString();
    const { data: recentOtps } = await supabase
      .from('email_otps')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .gte('created_at', tenMinutesAgo);

    if (recentOtps && recentOtps.length >= MAX_PENDING_PER_EMAIL) {
      return NextResponse.json(
        { error: 'Demasiados códigos solicitados. Por favor, aguarde 10 minutos e tente novamente.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    // Store in database
    const { error: insertError } = await supabase.from('email_otps').insert({
      email: email.toLowerCase(),
      code,
      form_type: formType,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('[OTP Send] Insert error:', insertError);
      return NextResponse.json({ error: 'Erro interno ao gerar o código.' }, { status: 500 });
    }

    // Send OTP email
    const emailResult = await sendEmail({
      to: email,
      subject: `${code} — Código de Verificação Covialvi`,
      html: otpEmailTemplate(code, formType),
    });

    if (!emailResult.success) {
      console.error('[OTP Send] Email error:', emailResult.error);
      // Clean up the stored OTP if email failed
      await supabase.from('email_otps').delete().eq('email', email.toLowerCase()).eq('code', code);
      return NextResponse.json({ error: 'Não foi possível enviar o e-mail. Por favor, tente novamente.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Código enviado com sucesso.' });
  } catch (error) {
    console.error('[OTP Send] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
