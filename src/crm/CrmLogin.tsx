import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  RefreshCw,
  ClipboardPaste,
  ShieldAlert,
  HelpCircle,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { getApiUrl } from '../config/api';

interface CrmLoginProps {
  onLoginSuccess: (adminName: string, adminToken?: string) => void;
  onBackToClient?: () => void;
}

interface TotpStatus {
  isConfigured: boolean;
  enabled: boolean;
  configuredAt?: string | null;
  configuredBy?: string | null;
  secret?: string | null;
  formattedSecret?: string | null;
  otpauthUrl?: string | null;
}

export const CrmLogin: React.FC<CrmLoginProps> = ({ onLoginSuccess, onBackToClient }) => {
  // Login credentials
  const [accessCode, setAccessCode] = useState('7860');
  const [adminName, setAdminName] = useState('Operations Manager');
  const [totpCode, setTotpCode] = useState('');

  // Status state
  const [totpStatus, setTotpStatus] = useState<TotpStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Setup Key helper toggle
  const [showSetupHelper, setShowSetupHelper] = useState(false);
  const [copiedHelperKey, setCopiedHelperKey] = useState(false);
  const [isRegeneratingOnLogin, setIsRegeneratingOnLogin] = useState(false);
  const [regenerateSuccess, setRegenerateSuccess] = useState('');

  const totpInputRef = useRef<HTMLInputElement>(null);

  // Fetch backend TOTP configuration status on mount
  const checkTotpStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/totp/status?t=${Date.now()}`), {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data?.success) {
        setTotpStatus({
          isConfigured: Boolean(data.isConfigured),
          enabled: Boolean(data.enabled),
          configuredAt: data.configuredAt,
          configuredBy: data.configuredBy,
          secret: data.secret,
          formattedSecret: data.formattedSecret,
          otpauthUrl: data.otpauthUrl,
        });
      }
    } catch (err) {
      console.warn('[CRM Login] Could not reach backend TOTP status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Direct real-time key regeneration from login screen
  const handleRegenerateFromLogin = async () => {
    setIsRegeneratingOnLogin(true);
    setRegenerateSuccess('');
    setError('');

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/regenerate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify({
          operatorName: adminName || 'Operations Manager',
          accessCode: accessCode.trim() || '7860',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to regenerate key from database');
      }

      setTotpStatus({
        isConfigured: true,
        enabled: true,
        configuredAt: data.configuredAt,
        configuredBy: data.configuredBy,
        secret: data.secret,
        formattedSecret: data.formattedSecret,
        otpauthUrl: data.otpauthUrl,
      });

      setRegenerateSuccess('✓ New Authenticator Key regenerated & saved in PostgreSQL!');
      if (data.secret) {
        navigator.clipboard.writeText(data.secret);
        setCopiedHelperKey(true);
        setTimeout(() => setCopiedHelperKey(false), 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to regenerate key');
    } finally {
      setIsRegeneratingOnLogin(false);
    }
  };

  useEffect(() => {
    checkTotpStatus();
  }, []);

  useEffect(() => {
    // Focus TOTP input automatically once loaded
    if (!isCheckingStatus && totpInputRef.current) {
      totpInputRef.current.focus();
    }
  }, [isCheckingStatus]);

  const handleAuthorizeSuccess = (operator: string, token: string) => {
    localStorage.setItem('pakinvest_admin_token', token);
    localStorage.setItem('pakinvest_crm_operator', operator);
    onLoginSuccess(operator, token);
  };

  // Quick Paste from Clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = text.replace(/\D/g, '').slice(0, 6);
      if (clean) {
        setTotpCode(clean);
        setError('');
      }
    } catch {
      // If clipboard access is blocked, focus the input for manual paste
      if (totpInputRef.current) {
        totpInputRef.current.focus();
      }
    }
  };

  // Standard login verification (Authenticates via TOTP code saved in DB)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanTotp = totpCode.trim().replace(/\D/g, '');

    // If TOTP is configured in database, ensure 6-digit code is provided
    if (totpStatus?.isConfigured && cleanTotp.length !== 6) {
      setError('Please enter or paste the 6-digit Authenticator Code from your app.');
      return;
    }

    // If TOTP is not yet configured, master PIN is required
    if (!totpStatus?.isConfigured && !accessCode.trim()) {
      setError('Master PIN (7860) is required for initial login.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/admin/totp/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorName: adminName.trim() || 'Operations Manager',
          accessCode: accessCode.trim() || '7860',
          totpCode: cleanTotp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Authentication failed. Please verify your code and credentials.');
      }

      handleAuthorizeSuccess(data.operator || adminName, data.adminToken);
    } catch (err: any) {
      setError(err?.message || 'Invalid Authenticator Code or Credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {onBackToClient && (
          <button
            type="button"
            id="btn-back-investor-portal"
            onClick={onBackToClient}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Investor Portal</span>
          </button>
        )}

        {/* Branding & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-1 shadow-lg shadow-emerald-950">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">Investify CRM</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              2FA SECURED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {totpStatus?.isConfigured
              ? 'Copy 6-digit code from your authenticator app and paste here to login.'
              : 'Enter authorization credentials to access CRM.'}
          </p>
        </div>

        {/* Status Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Unconfigured Alert Info */}
        {!isCheckingStatus && !totpStatus?.isConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Initial Setup Required</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No authenticator key configured yet in DB. Login with Master PIN (7860), then go to <strong>CRM Settings &gt; Security &amp; 2FA Key</strong> to generate and save your key.
            </p>
          </div>
        )}

        {/* Primary Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* 6-Digit Authenticator Code (Primary for CRM) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>6-Digit Authenticator Code</span>
              </label>
              <button
                type="button"
                id="btn-paste-totp-clipboard"
                onClick={handlePasteClipboard}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste Code</span>
              </button>
            </div>
            <div className="relative">
              <input
                ref={totpInputRef}
                type="text"
                id="input-crm-totp-code"
                value={totpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setTotpCode(val);
                }}
                placeholder="000000"
                maxLength={6}
                autoFocus
                className="w-full py-3 px-4 text-center rounded-2xl bg-slate-950 border-2 border-emerald-500/60 text-emerald-300 text-2xl font-mono tracking-widest placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 font-bold transition-all shadow-inner"
                required={Boolean(totpStatus?.isConfigured)}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center pt-0.5">
              Copy the active code from Google Authenticator, Microsoft Authenticator, or Authy.
            </p>

            {/* First Time / Setup Key Quick Helper */}
            <div className="pt-1.5 text-center">
              <button
                type="button"
                id="btn-toggle-setup-helper"
                onClick={() => setShowSetupHelper(!showSetupHelper)}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline transition-colors inline-flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>
                  {showSetupHelper ? 'Hide Authenticator Setup Key' : 'First time? Click to view Key & QR Code'}
                </span>
              </button>
            </div>

            {showSetupHelper && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-left"
              >
                <div className="flex items-center justify-between text-xs text-white font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                    <span>Database Authenticator Key</span>
                  </span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">RFC 6238 TOTP</span>
                </div>

                {regenerateSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>{regenerateSuccess}</span>
                  </div>
                )}

                {totpStatus?.otpauthUrl && (
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="p-2.5 bg-white rounded-xl shadow-md border border-emerald-500/30">
                      <QRCodeSVG value={totpStatus.otpauthUrl} size={130} level="M" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Scan in Google Authenticator or Authy</span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-medium">Or paste setup key into app:</span>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <code className="text-xs font-mono text-emerald-400 flex-1 break-all select-all font-bold tracking-wider">
                      {totpStatus?.formattedSecret || totpStatus?.secret || 'Loading database key...'}
                    </code>
                    {totpStatus?.secret && (
                      <button
                        type="button"
                        id="btn-copy-helper-key"
                        onClick={() => {
                          navigator.clipboard.writeText(totpStatus.secret!);
                          setCopiedHelperKey(true);
                          setTimeout(() => setCopiedHelperKey(false), 2500);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                        title="Copy Key"
                      >
                        {copiedHelperKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {copiedHelperKey && (
                    <span className="text-[10px] text-emerald-400 block text-right font-semibold">
                      Key copied to clipboard!
                    </span>
                  )}
                </div>

                {/* Regenerate Button Right on Login Screen */}
                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    id="btn-regenerate-from-login"
                    onClick={handleRegenerateFromLogin}
                    disabled={isRegeneratingOnLogin}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingOnLogin ? 'animate-spin' : ''}`} />
                    <span>{isRegeneratingOnLogin ? 'Regenerating in DB...' : 'Regenerate New Key in Database'}</span>
                  </button>
                </div>

                <ol className="text-[11px] text-slate-400 list-decimal list-inside space-y-0.5 pt-1 border-t border-slate-800/80">
                  <li>Open Google Authenticator on your phone</li>
                  <li>Tap &quot;+&quot; &gt; &quot;Enter a setup key&quot; (or scan QR above)</li>
                  <li>Account: <strong>PakInvest CRM</strong> | Key: <strong>Paste key above</strong></li>
                  <li>Paste the 6-digit code above and click Authenticate!</li>
                </ol>
              </motion.div>
            )}
          </div>

          {/* Operator Name & Master PIN (Compact Credentials) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Operator ID</label>
              <div className="relative">
                <UserCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="input-crm-operator-name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Operations Manager"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Master PIN</label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  id="input-crm-master-pin"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Master PIN (7860)"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Authenticate Submit Button */}
          <button
            type="submit"
            id="btn-crm-authenticate"
            disabled={isLoading || isCheckingStatus}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Authenticator Code...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authenticate &amp; Open CRM</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Security Note */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-1">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>Authenticator keys are managed and regeneratable in CRM Settings.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
