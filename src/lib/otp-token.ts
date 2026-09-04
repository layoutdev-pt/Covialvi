import { createHmac } from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'covialvi-otp-secret-change-in-production';

/** Verify a previously issued HMAC token (used by form submission APIs) */
export function verifyOtpToken(
  token: string,
  email: string,
  formType: string,
  maxAgeMs = 15 * 60 * 1000
): boolean {
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

/** Generate a short-lived HMAC token after successful OTP verification */
export function generateVerifiedToken(email: string, formType: string): string {
  const payload = `${email}:${formType}:${Date.now()}`;
  const hmac = createHmac('sha256', OTP_SECRET);
  hmac.update(payload);
  return `${Buffer.from(payload).toString('base64')}.${hmac.digest('hex')}`;
}
