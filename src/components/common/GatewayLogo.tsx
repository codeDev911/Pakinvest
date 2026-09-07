import React, { useState } from 'react';
import { GatewayType } from '../../types';

interface GatewayLogoProps {
  gateway: GatewayType | string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

interface LogoConfig {
  src: string;
  alt: string;
  label: string;
  padding?: string;
}

// REAL, AUTHENTIC BRAND LOGOS (Retrieved directly from official brands / Wikimedia Commons)
const LOGO_CONFIGS: Record<string, LogoConfig> = {
  JazzCash: {
    src: '/logos/jazzcash.png',
    alt: 'JazzCash',
    label: 'JazzCash',
    padding: 'p-0.5',
  },
  EasyPaisa: {
    src: '/logos/easypaisa.png',
    alt: 'EasyPaisa',
    label: 'EasyPaisa',
    padding: 'p-1',
  },
  Raast: {
    src: '/logos/raast.svg',
    alt: 'Raast Instant Payment (State Bank of Pakistan)',
    label: 'Raast Instant',
    padding: 'p-0.5',
  },
  Bank_Transfer: {
    src: '/logos/meezan.png',
    alt: 'Meezan Bank Transfer',
    label: 'Meezan / Bank',
    padding: 'p-1',
  },
  Bank: {
    src: '/logos/meezan.png',
    alt: 'Bank Transfer',
    label: 'Bank Account',
    padding: 'p-1',
  },
  Meezan: {
    src: '/logos/meezan.png',
    alt: 'Meezan Bank',
    label: 'Meezan Bank',
    padding: 'p-1',
  },
  'Meezan Bank': {
    src: '/logos/meezan.png',
    alt: 'Meezan Bank',
    label: 'Meezan Bank',
    padding: 'p-1',
  },
  HBL: {
    src: '/logos/hbl.svg',
    alt: 'Habib Bank Limited (HBL)',
    label: 'Habib Bank (HBL)',
    padding: 'p-0.5',
  },
  'Habib Bank Limited (HBL)': {
    src: '/logos/hbl.svg',
    alt: 'Habib Bank Limited (HBL)',
    label: 'Habib Bank (HBL)',
    padding: 'p-0.5',
  },
  USDT_TRC20: {
    src: '/logos/tether.svg',
    alt: 'Tether USDT (TRC20)',
    label: 'USDT (TRC20)',
    padding: 'p-0.5',
  },
  USDT: {
    src: '/logos/tether.svg',
    alt: 'Tether USDT',
    label: 'Tether USDT',
    padding: 'p-0.5',
  },
  SadaPay: {
    src: '/logos/sadapay.png',
    alt: 'SadaPay',
    label: 'SadaPay',
    padding: 'p-0.5',
  },
  NayaPay: {
    src: '/logos/nayapay_touch.png',
    alt: 'NayaPay',
    label: 'NayaPay',
    padding: 'p-0.5',
  },
};

export const GatewayLogo: React.FC<GatewayLogoProps> = ({
  gateway,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  };

  // Determine logo configuration based on gateway name or string match
  const getLogoConfig = (): LogoConfig => {
    if (LOGO_CONFIGS[gateway]) {
      return LOGO_CONFIGS[gateway];
    }

    const lower = String(gateway || '').toLowerCase();
    if (lower.includes('jazz')) return LOGO_CONFIGS.JazzCash;
    if (lower.includes('easy')) return LOGO_CONFIGS.EasyPaisa;
    if (lower.includes('raast')) return LOGO_CONFIGS.Raast;
    if (lower.includes('hbl') || lower.includes('habib')) return LOGO_CONFIGS.HBL;
    if (lower.includes('sada')) return LOGO_CONFIGS.SadaPay;
    if (lower.includes('naya')) return LOGO_CONFIGS.NayaPay;
    if (lower.includes('usdt') || lower.includes('tether')) return LOGO_CONFIGS.USDT_TRC20;
    if (lower.includes('meezan') || lower.includes('bank')) return LOGO_CONFIGS.Bank_Transfer;

    return {
      src: '/logos/meezan.png',
      alt: gateway,
      label: gateway,
      padding: 'p-1',
    };
  };

  const config = getLogoConfig();

  const logoElement = (
    <div
      className={`relative flex items-center justify-center overflow-hidden shrink-0 select-none bg-white border border-slate-200/80 shadow-xs ${sizeClasses[size]} ${className}`}
      title={config.alt}
    >
      {!hasError ? (
        <img
          src={config.src}
          alt={config.alt}
          className={`w-full h-full object-contain ${config.padding || 'p-1'}`}
          loading="eager"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-extrabold text-[10px] text-slate-700 uppercase">
          {gateway.slice(0, 2)}
        </span>
      )}
    </div>
  );

  if (!showLabel) {
    return logoElement;
  }

  return (
    <div className="flex items-center gap-2">
      {logoElement}
      <span className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">
        {config.label}
      </span>
    </div>
  );
};

