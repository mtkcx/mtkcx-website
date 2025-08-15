import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mtkcx.mobile',
  appName: 'MTKCx',
  webDir: 'dist',
  server: {
    url: "https://2b082f57-ea56-4226-9792-5934ae718ea9.lovableproject.com?forceHideBadge=true",
    cleartext: true
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