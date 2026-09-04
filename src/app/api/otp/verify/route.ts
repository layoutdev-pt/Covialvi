import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

const OTP_SECRET = process.env.OTP_SECRET || 'covialvi-otp-secret-change-in-production';
const MAX_ATTEMPTS = 5;

/** Generate a short-lived HMAC token after successful verification */
function generateVerifiedToken(email: string, formType: string): string {
  const payload = `${email}:${formType}:${Date.now()}`;
  const hmac = createHmac('sha256', OTP_SECRET);
  hmac.update(payload);
  return `${Buffer.from(payload).toString('base64')}.${hmac.digest('hex')}`;
}

/** Verify a previously issued token (used by form submission APIs) */
export function verifyOtpToken(token: string, email: string, formType: string, maxAgeMs = 15 * 60 * 1000): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const payload = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const [tokenEmail, tokenFormType, timestampStr] = payload.split(':');

    // Validate email and formType
    if (tokenEmail !== email.toLowerCase() || tokenFormType !== formType) return false;

    // Validate timestamp (token must be fresh)
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) return false;

    // Validate HMAC signature
    const hmac = createHmac('sha256', OTP_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, formType } = await request.json();

    if (!email || !code || !formType) {
      return NextResponse.json({ error: 'Email, código e tipo de formulário são obrigatórios.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createServiceClient();

    // Find the most recent valid OTP for this email and formType
    const { data: otpRecord, error: fetchError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('form_type', formType)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json({ error: 'Código inválido ou expirado. Por favor, solicite um novo.' }, { status: 400 });
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      // Mark as used to prevent brute-force
      await supabase.from('email_otps').update({ used: true }).eq('id', otpRecord.id);
      return NextResponse.json({ error: 'Demasiadas tentativas. Por favor, solicite um novo código.' }, { status: 429 });
    }

    // Increment attempts
    await supabase.from('email_otps').update({ attempts: otpRecord.attempts + 1 }).eq('id', otpRecord.id);

    // Verify code
    if (otpRecord.code !== code.trim()) {
      const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
      return NextResponse.json(
        { error: `Código incorreto. ${remaining > 0 ? `Restam ${remaining} tentativa(s).` : 'Sem tentativas restantes.'}` },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await supabase.from('email_otps').update({ used: true }).eq('id', otpRecord.id);

    // Cleanup old expired OTPs for this email
    await supabase
      .from('email_otps')
      .delete()
      .eq('email', normalizedEmail)
      .lt('expires_at', new Date().toISOString());

    // Generate a verified token for the form submission
    const verifiedToken = generateVerifiedToken(normalizedEmail, formType);

    return NextResponse.json({
      success: true,
      verifiedToken,
    });
  } catch (error) {
    console.error('[OTP Verify] Unexpected error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
