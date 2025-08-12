import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mtkcx.mobile',
  appName: 'MTKCx',
  webDir: 'dist',
  server: {
    // Remove this section for production build
    // For development, add back the url property
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  },
  ios: {
    scheme: 'MTKCx'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;