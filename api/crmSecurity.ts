import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'pakinvest_jwt_secret_key_2025_prod';

export interface CrmSecurityConfig {
  secretAccessKey: string;
  totpSecret: string;
  totpIssuer: string;
  totpAccount: string;
  lastRotatedAt: string;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 32): string {
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += BASE32_ALPHABET[randomBytes[i] % 32];
  }
  return result;
}

export function generateCryptographicAccessKey(): string {
  // A long, unguessable cryptographic token that cannot be entered or guessed manually
  const randomHex = crypto.randomBytes(24).toString('hex');
  return `crm_sec_team_${randomHex}`;
}

export function base32Decode(base32: string): Buffer {
  const sanitized = base32.toUpperCase().replace(/[\s-=]/g, '');
  let bits = '';
  for (let i = 0; i < sanitized.length; i++) {
    const val = BASE32_ALPHABET.indexOf(sanitized.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

// RFC 6238 Standard Time-Based One-Time Password (TOTP)
export function generateTotp(secret: string, timeStepOffset = 0): string {
  try {
    const key = base32Decode(secret);
    if (key.length === 0) return '000000';
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30) + timeStepOffset;
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)) %
      1000000;
    return code.toString().padStart(6, '0');
  } catch (err) {
    console.error('[generateTotp error]:', err);
    return '000000';
  }
}

// Verifies TOTP against Google Authenticator / Authy with +/- 1 window tolerance
export function verifyTotp(candidateCode: string, secret: string): boolean {
  if (!candidateCode || candidateCode.trim().length !== 6) return false;
  const cleanCode = candidateCode.trim();
  for (let offset = -1; offset <= 1; offset++) {
    if (generateTotp(secret, offset) === cleanCode) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUrl(config: CrmSecurityConfig): string {
  const issuer = encodeURIComponent(config.totpIssuer || 'Investify CRM');
  const account = encodeURIComponent(config.totpAccount || 'team@investify.pk');
  return `otpauth://totp/${issuer}:${account}?secret=${config.totpSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('[generateQrCodeDataUrl error]:', err);
    return '';
  }
}

// Persistent database fetch & initialize
export async function getOrInitCrmSecurityConfig(prisma: PrismaClient): Promise<CrmSecurityConfig> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'crm_security_config' },
    });

    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (parsed.secretAccessKey && parsed.totpSecret) {
        return parsed as CrmSecurityConfig;
      }
    }
  } catch (err) {
    console.error('[getOrInitCrmSecurityConfig fetch error]:', err);
  }

  // Fallback / Initial seed: use environment variables or generate strong cryptographic defaults
  const envSecretKey = process.env.CRM_SECRET_KEY && process.env.CRM_SECRET_KEY.trim().length > 16
    ? process.env.CRM_SECRET_KEY.trim()
    : generateCryptographicAccessKey();

  const envTotpSecret = process.env.CRM_TOTP_SECRET && process.env.CRM_TOTP_SECRET.trim().length >= 16
    ? process.env.CRM_TOTP_SECRET.trim().toUpperCase()
    : generateBase32Secret(32);

  const initialConfig: CrmSecurityConfig = {
    secretAccessKey: envSecretKey,
    totpSecret: envTotpSecret,
    totpIssuer: 'Investify Operations CRM',
    totpAccount: 'internal-team@investify.pk',
    lastRotatedAt: new Date().toISOString(),
  };

  try {
    await prisma.systemSetting.upsert({
      where: { key: 'crm_security_config' },
      update: { value: JSON.stringify(initialConfig) },
      create: {
        key: 'crm_security_config',
        value: JSON.stringify(initialConfig),
      },
    });
  } catch (err) {
    console.error('[getOrInitCrmSecurityConfig upsert error]:', err);
  }

  return initialConfig;
}

export async function saveCrmSecurityConfig(prisma: PrismaClient, newConfig: CrmSecurityConfig): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: 'crm_security_config' },
    update: { value: JSON.stringify(newConfig) },
    create: {
      key: 'crm_security_config',
      value: JSON.stringify(newConfig),
    },
  });
}

export function signAdminJwt(operatorName: string): string {
  return jwt.sign(
    {
      role: 'crm_admin',
      operatorName: operatorName.trim(),
      authType: 'team_passkey_2fa',
      issuedAt: Date.now(),
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function verifyAdminJwt(token: string): { valid: boolean; operatorName?: string; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && (decoded.role === 'crm_admin' || decoded.operatorName || decoded.isAdmin)) {
      return { valid: true, operatorName: decoded.operatorName || 'Admin Operator' };
    }
    return { valid: false, error: 'Token missing admin permissions.' };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Invalid or expired admin token.' };
  }
}
