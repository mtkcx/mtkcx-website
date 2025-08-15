import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Wifi, WifiOff, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const MobilePWAFeatures: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Online/Offline Detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: t('mobile.pwa.install_success'),
        description: t('mobile.pwa.install_success_desc'),
      });
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleNotificationRequest = async () => {
    if (!('Notification' in window)) {
      toast({
        title: t('mobile.pwa.notifications_not_supported'),
        variant: 'destructive',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      toast({
        title: t('mobile.pwa.notifications_enabled'),
        description: t('mobile.pwa.notifications_enabled_desc'),
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Install App Prompt */}
      {isInstallable && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">{t('mobile.pwa.install_app')}</h3>
              <p className="text-sm text-muted-foreground">{t('mobile.pwa.install_app_desc')}</p>
            </div>
            <Button onClick={handleInstallClick} size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('mobile.pwa.install')}
            </Button>
          </div>
        </Card>
      )}

      {/* Network Status */}
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <div className="flex items-center gap-2 text-green-600">
            <Wifi className="h-4 w-4" />
            <span>{t('mobile.pwa.online')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span>{t('mobile.pwa.offline')}</span>
          </div>
        )}
      </div>

      {/* Notification Permission */}
      {notificationPermission === 'default' && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t('mobile.pwa.enable_notifications')}</h3>
              <p className="text-sm text-muted-foreground">{t('mobile.pwa.enable_notifications_desc')}</p>
            </div>
            <Button onClick={handleNotificationRequest} size="sm" variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              {t('mobile.pwa.enable')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};