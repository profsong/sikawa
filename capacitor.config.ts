import type { CapacitorConfig } from '@capacitor/cli';
import { APP_NAME } from './src/core/branding.ts';

const config: CapacitorConfig = {
  appId: 'com.siikawa.app',
  appName: APP_NAME,
  webDir: 'dist-android',
  android: {
    backgroundColor: '#fbfdff',
    allowMixedContent: false,
  },
};

export default config;
