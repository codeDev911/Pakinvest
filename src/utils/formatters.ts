import confetti from 'canvas-confetti';

export function formatPKR(amount: number, options?: { showPrefix?: boolean; decimals?: boolean; compact?: boolean }): string {
  const { showPrefix = true, decimals = false, compact = false } = options || {};

  if (compact && Math.abs(amount) >= 10000000) {
    const crores = (amount / 10000000).toFixed(2);
    return `${showPrefix ? 'Rs. ' : ''}${crores} Cr`;
  }
  if (compact && Math.abs(amount) >= 100000) {
    const lakhs = (amount / 100000).toFixed(2);
    return `${showPrefix ? 'Rs. ' : ''}${lakhs} Lakh`;
  }

  const num = Number(amount || 0);
  const formatted = num.toLocaleString('en-PK', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
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
