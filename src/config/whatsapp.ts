/**
 * Configuration helper for the official WhatsApp channel.
 * Uses the VITE_WHATSAPP_CHANNEL_URL environment variable with a standard fallback.
 */
export const getWhatsAppChannelUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_WHATSAPP_CHANNEL_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return 'https://whatsapp.com/channel/0029VaInvestifyOfficial';
};
