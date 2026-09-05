import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.investify.app',
  appName: 'Investify',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#10b981'
    }
  }
};

export default config;
