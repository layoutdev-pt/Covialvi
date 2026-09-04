import { promises as dns } from 'dns';

/**
 * List of known disposable email domains or generic test domains
 */
const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
  'tempmail.com', 'temp-mail.org', 'fakeinbox.com', 'throwawaymail.com',
  'teste.com', 'test.com', 'example.com', 'teste.pt', 'test.pt', 'dummy.com',
  'asdf.com', 'qwerty.com'
]);

/**
 * List of strings that usually indicate a fake local part in an email
 */
const FAKE_LOCAL_PATTERNS = [
  /^teste?\d*$/,
  /^test\d*$/,
  /^admin\d*$/,
  /^12345/,
  /^asdf/,
  /^qwerty/
];

/**
 * Verifies if an email is mathematically valid, not in a blacklist, 
 * and its domain has actual MX records.
 * @param email Email to verify
 * @returns true if valid, false if invalid or fake
 */
export async function verifyRealEmail(email: string): Promise<boolean> {
  if (!email || typeof email !== 'string') return false;

  // 1. Basic format validation
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return false;
  }

  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const localPart = parts[0].toLowerCase();
  const domain = parts[1].toLowerCase();

  // 2. Blacklist validation (Local part)
  for (const pattern of FAKE_LOCAL_PATTERNS) {
    if (pattern.test(localPart)) {
      return false; // Fake name detected
    }
  }

  // 3. Blacklist validation (Domain part)
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return false; // Disposable or test domain
  }

  // 4. DNS MX Record Validation
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return false; // Domain exists but cannot receive emails
    }
    
    // Sort by priority (lowest first) to verify at least one has a valid exchange
    const validExchange = mxRecords.some(record => record.exchange && record.exchange.length > 0);
    return validExchange;
  } catch (error: any) {
    // If ENOTFOUND or ENODATA, the domain doesn't exist or has no MX records
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'SERVFAIL') {
      return false;
    }
    // If it's a temporary DNS issue (TIMEOUT), we might want to accept it to avoid false positives,
    // but typically we can assume it's risky. For safety against temporary issues, we accept it.
    console.warn(`[Email Validator] DNS check failed for ${domain} with error ${error.code}. Allowing temporarily.`);
    return true;
  }
}
