import confetti from 'canvas-confetti';

export function formatPKR(
  amount: number,
  options?: { showPrefix?: boolean; decimals?: boolean; microDecimals?: boolean; compact?: boolean }
): string {
  const { showPrefix = true, decimals = false, microDecimals = false, compact = false } = options || {};

  if (compact && Math.abs(amount) >= 10000000) {
    const crores = (amount / 10000000).toFixed(2);
    return `${showPrefix ? 'Rs. ' : ''}${crores} Cr`;
  }
  if (compact && Math.abs(amount) >= 100000) {
    const lakhs = (amount / 100000).toFixed(2);
    return `${showPrefix ? 'Rs. ' : ''}${lakhs} Lakh`;
  }

  const num = Number(amount || 0);
  const minDigits = microDecimals ? 4 : decimals ? 2 : 0;
  const maxDigits = microDecimals ? 4 : decimals ? 2 : 0;

  const formatted = num.toLocaleString('en-PK', {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  return showPrefix ? `Rs. ${formatted}` : formatted;
}

export function fireConfetti(): void {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'],
    });
  } catch (e) {
    console.log('Confetti failed gracefully', e);
  }
}

export function generateTxId(prefix: string = 'TXN'): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomNum}`;
}

export function generateRefCode(prefix: string = 'REF'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export function formatCountdown(targetTimestamp: number, currentTimestamp: number = Date.now()): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
  percentElapsed: number;
  isReady: boolean;
  totalSecondsLeft: number;
} {
  const diffMs = targetTimestamp - currentTimestamp;
  if (diffMs <= 0) {
    return {
      hours: '00',
      minutes: '00',
      seconds: '00',
      formatted: '00:00:00',
      percentElapsed: 100,
      isReady: true,
      totalSecondsLeft: 0,
    };
  }

  const totalSecondsLeft = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSecondsLeft / 3600);
  const m = Math.floor((totalSecondsLeft % 3600) / 60);
  const s = totalSecondsLeft % 60;

  const hours = String(h).padStart(2, '0');
  const minutes = String(m).padStart(2, '0');
  const seconds = String(s).padStart(2, '0');

  // 24 hours in ms = 86,400,000
  const elapsedMs = Math.max(0, 86400000 - diffMs);
  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsedMs / 86400000) * 100)));

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}:${minutes}:${seconds}`,
    percentElapsed,
    isReady: false,
    totalSecondsLeft,
  };
}

export function getPlanCycleTimeFormatted(timestamp?: number, fallbackStr?: string): string {
  if (timestamp) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }
  if (fallbackStr && fallbackStr.includes(':')) {
    return fallbackStr;
  }
  return '02:33 PM';
}
