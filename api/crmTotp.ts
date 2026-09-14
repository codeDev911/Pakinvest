import crypto from 'crypto';
import express from 'express';
import type { PrismaClient } from '@prisma/client';

// Allowed Master Authorization PINs for CRM administrators
const VALID_MASTER_PINS = ['admin123', '7860', 'admin786', 'pakinvest', '1234'];

export interface CrmTotpConfig {
  enabled: boolean;
  secret: string;
  configuredAt: string;
  configuredBy: string;
  issuer: string;
}

// In-memory fallback/cache in case DB has transient connectivity
let cachedTotpConfig: CrmTotpConfig | null = null;
let pendingSetupSecret: { secret: string; expiresAt: number } | null = null;

// Base32 Alphabet RFC 4648
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(str: string): Buffer {
  const cleanStr = str.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < cleanStr.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * Generate 6-digit TOTP code according to RFC 6238 (HMAC-SHA1, 30s period)
 */
export function generateTotpCode(secretBase32: string, timeStepOffset = 0): string {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / 30) + timeStepOffset;
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1000000;
  return code.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP code with clock drift tolerance (window: -1, 0, +1 time steps = 90s total window)
 */
export function verifyTotpCode(secretBase32: string, token: string): boolean {
  if (!secretBase32 || !token) return false;
  const cleanToken = token.trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  // Check current time step, previous (-1), and next (+1) to absorb device clock drift
  for (let offset = -1; offset <= 1; offset++) {
    const expected = generateTotpCode(secretBase32, offset);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}

/**
 * Fetch saved CRM TOTP config securely from PostgreSQL SystemSetting table
 */
export async function getStoredCrmTotpConfig(prisma: PrismaClient): Promise<CrmTotpConfig | null> {
  if (cachedTotpConfig && cachedTotpConfig.enabled) {
    return cachedTotpConfig;
  }
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'crm_totp_config' },
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      if (parsed && typeof parsed.secret === 'string') {
        cachedTotpConfig = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('[getStoredCrmTotpConfig Error]:', err);
  }
  return cachedTotpConfig;
}

/**
 * Save CRM TOTP config securely into PostgreSQL SystemSetting table
 */
export async function saveCrmTotpConfig(prisma: PrismaClient, config: CrmTotpConfig): Promise<void> {
  cachedTotpConfig = config;
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'crm_totp_config' },
      update: { value: JSON.stringify(config) },
      create: { key: 'crm_totp_config', value: JSON.stringify(config) },
    });
  } catch (err) {
    console.error('[saveCrmTotpConfig Error]:', err);
  }
}

/**
 * Delete / Reset CRM TOTP config from storage
 */
export async function clearCrmTotpConfig(prisma: PrismaClient): Promise<void> {
  cachedTotpConfig = null;
  try {
    await prisma.systemSetting.delete({
      where: { key: 'crm_totp_config' },
    });
  } catch (err) {
    // Ignore if not exists
  }
}

function generateAdminToken(operator: string): string {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(8).toString('hex');
  const encodedName = Buffer.from(operator).toString('base64').replace(/=/g, '');
  return `adm_totp_${timestamp}_${randomHex}_${encodedName}`;
}

// ----------------------------------------------------
// CRM TOTP ROUTER FACTORY (Isolated Strictly to CRM - Zero Client API Impact)
// ----------------------------------------------------
export function createCrmTotpRouter(prisma: PrismaClient) {
  const router = express.Router();

  /**
   * GET /api/admin/totp/status
   * Check if TOTP is configured in the backend
   */
  router.get('/status', async (req, res) => {
    try {
      const config = await getStoredCrmTotpConfig(prisma);
      res.json({
        success: true,
        isConfigured: Boolean(config && config.enabled && config.secret),
        enabled: Boolean(config && config.enabled),
        configuredAt: config?.configuredAt || null,
        configuredBy: config?.configuredBy || null,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to check TOTP status' });
    }
  });

  /**
   * POST /api/admin/totp/generate
   * Generate a new TOTP secret, QR code URL, and formatted manual key
   */
  router.post('/generate', async (req, res) => {
    try {
      const { operatorName = 'Operations Officer' } = req.body || {};

      // Generate 20 cryptographically secure random bytes = 160 bits (RFC recommendation)
      const randomBytes = crypto.randomBytes(20);
      const secret = base32Encode(randomBytes);

      const issuer = 'PakInvest CRM';
      const account = operatorName.trim() || 'Admin Operator';
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

      // Format secret with spaces for human readability: e.g. "ABCD EFGH IJKL MNOP QRST UVWX YZ23 4567"
      const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;

      // Cache pending secret for 10 minutes to allow verification
      pendingSetupSecret = {
        secret,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };

      res.json({
        success: true,
        secret,
        formattedSecret,
        manualSetupKey: secret,
        otpauthUrl,
        issuer,
        account,
        expiresInSeconds: 600,
      });
    } catch (err: any) {
      console.error('[CRM TOTP Generate Error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to generate TOTP secret' });
    }
  });

  /**
   * POST /api/admin/totp/verify-setup
   * Verify the 6-digit TOTP code against the secret and securely save it in backend
   */
  router.post('/verify-setup', async (req, res) => {
    try {
      const { secret, code, operatorName = 'Operations Officer', accessCode = '' } = req.body || {};

      if (!secret || typeof secret !== 'string') {
        return res.status(400).json({ success: false, error: 'Secret key is missing from verification request' });
      }

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'Please enter the 6-digit code from your authenticator app' });
      }

      // Verify Master PIN if provided or check if PIN is valid
      const cleanPin = (accessCode || '').trim().toLowerCase();
      if (cleanPin && !VALID_MASTER_PINS.includes(cleanPin)) {
        return res.status(401).json({ success: false, error: 'Invalid Master Authorization PIN.' });
      }

      const isValid = verifyTotpCode(secret, code);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid 6-digit Authenticator Code. Ensure your phone clock is accurate and try again.',
        });
      }

      // Save secret safely in database
      const config: CrmTotpConfig = {
        enabled: true,
        secret: secret.trim().toUpperCase(),
        configuredAt: new Date().toISOString(),
        configuredBy: operatorName.trim() || 'Admin Operator',
        issuer: 'PakInvest CRM',
      };

      await saveCrmTotpConfig(prisma, config);
      pendingSetupSecret = null;

      const adminToken = generateAdminToken(config.configuredBy);

      res.json({
        success: true,
        verified: true,
        operator: config.configuredBy,
        adminToken,
        message: 'TOTP Authentication verified and activated successfully. CRM access granted.',
      });
    } catch (err: any) {
      console.error('[CRM TOTP Verify Setup Error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to verify TOTP setup' });
    }
  });

  /**
   * POST /api/admin/totp/login
   * Complete CRM login requiring Master PIN AND 6-digit TOTP verification if configured
   */
  router.post('/login', async (req, res) => {
    try {
      const { operatorName = 'Operations Officer', accessCode = '', totpCode = '' } = req.body || {};

      const cleanPin = (accessCode || '').trim().toLowerCase();
      if (!VALID_MASTER_PINS.includes(cleanPin)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Master Authorization PIN. (Default: 7860 or admin123)',
        });
      }

      const config = await getStoredCrmTotpConfig(prisma);

      // If TOTP is configured and enabled, require and verify the 6-digit code
      if (config && config.enabled && config.secret) {
        if (!totpCode || totpCode.trim().length === 0) {
          return res.status(403).json({
            success: false,
            requiresTotp: true,
            error: 'TOTP Authenticator Code required. Enter the 6-digit code from your authenticator app.',
          });
        }

        const isTotpValid = verifyTotpCode(config.secret, totpCode);
        if (!isTotpValid) {
          return res.status(401).json({
            success: false,
            requiresTotp: true,
            error: 'Invalid 6-digit Authenticator code. Please check your authenticator app and try again.',
          });
        }
      }

      const operator = operatorName.trim() || config?.configuredBy || 'Admin Operator';
      const adminToken = generateAdminToken(operator);

      res.json({
        success: true,
        operator,
        adminToken,
        totpEnabled: Boolean(config?.enabled),
        message: 'CRM Authorization verified successfully.',
      });
    } catch (err: any) {
      console.error('[CRM TOTP Login Error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'CRM Authentication failed' });
    }
  });

  /**
   * POST /api/admin/totp/reset
   * Reset/Reconfigure CRM TOTP with Master Authorization PIN
   */
  router.post('/reset', async (req, res) => {
    try {
      const { masterPin = '' } = req.body || {};
      const cleanPin = masterPin.trim().toLowerCase();

      if (!VALID_MASTER_PINS.includes(cleanPin)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Master Authorization PIN. Master authorization is required to reset TOTP.',
        });
      }

      await clearCrmTotpConfig(prisma);
      pendingSetupSecret = null;

      res.json({
        success: true,
        message: 'CRM TOTP configuration has been reset. You may now generate a new secret and QR code.',
      });
    } catch (err: any) {
      console.error('[CRM TOTP Reset Error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to reset CRM TOTP' });
    }
  });

  return router;
}
