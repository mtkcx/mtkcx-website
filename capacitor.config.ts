import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2b082f57ea56422697925934ae718ea9',
  appName: 'mtkcx-website',
  webDir: 'dist',
  server: {
    url: 'https://2b082f57-ea56-4226-9792-5934ae718ea9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;