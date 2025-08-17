import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.educationalgames.app',
  appName: 'Развивающие игры',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
