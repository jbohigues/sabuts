import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.sabuts.app',
  appName: 'Sabuts',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
};

export default config;
