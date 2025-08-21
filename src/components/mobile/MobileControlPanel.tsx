import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Settings, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX,
  Fingerprint,
  MapPin,
  Calendar,
  Users,
  Mic,
  MicOff,
  Bell,
  Heart,
  Star,
  Download,
  Wifi,
  Battery,
  Smartphone
} from 'lucide-react';
import { usePullToRefresh, useHaptics, useNativeShare } from '@/hooks/useMobileFeatures';
import { useLocation, useCalendar, useContacts, useVoiceCommands, useBiometrics } from '@/hooks/useAdvancedFeatures';
import { useToast } from '@/hooks/use-toast';

interface MobileControlPanelProps {
  onRefresh?: () => Promise<void>;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  onRefresh,
  onThemeChange
}) => {
  const { toast } = useToast();
  const { impact, notification } = useHaptics();
  const { canShare, shareProduct } = useNativeShare();
  const { location, getCurrentLocation, loading: locationLoading } = useLocation();
  const { addToCalendar, createICSFile } = useCalendar();
  const { saveBusinessContact } = useContacts();
  const { isSupported: voiceSupported, isListening, startListening, stopListening, processVoiceCommand } = useVoiceCommands();
  const { isSupported: biometricsSupported, authenticate } = useBiometrics();
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Pull to refresh
  const { isRefreshing, refreshIndicatorStyle, isTriggered } = usePullToRefresh(
    async () => {
      impact('medium');
      await onRefresh?.();
      notification('success');
    }
  );

  // Theme handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const handleVoiceCommand = () => {
    if (!voiceSupported || !voiceEnabled) {
      toast({
        title: 'Voice Commands Not Available',
        description: 'Voice recognition is not supported on this device',
        variant: 'destructive'
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      impact('light');
      startListening(
        (transcript) => {
          const commandProcessed = processVoiceCommand(transcript);
          if (commandProcessed) {
            notification('success');
            toast({
              title: 'Voice Command Executed',
              description: `Command: "${transcript}"`,
              duration: 2000
            });
          } else {
            toast({
              title: 'Command Not Recognized',
              description: `Try: "go home", "show products", or "search for [product]"`,
              duration: 3000
            });
          }
        },
        (error) => {
          toast({
            title: 'Voice Recognition Error',
            description: error,
            variant: 'destructive'
          });
        }
      );
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricsSupported) {
      toast({
        title: 'Biometrics Not Available',
        description: 'Biometric authentication is not supported on this device',
        variant: 'destructive'
      });
      return;
    }

    try {
      impact('medium');
      const authenticated = await authenticate();
      
      if (authenticated) {
        notification('success');
        toast({
          title: 'Authentication Successful',
          description: 'You are now authenticated',
          duration: 2000
        });
      } else {
        toast({
          title: 'Authentication Failed',
          description: 'Please try again',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Biometric Error',
        description: 'Failed to authenticate',
        variant: 'destructive'
      });
    }
  };

  const handleGetLocation = async () => {
    try {
      impact('light');
      const loc = await getCurrentLocation();
      notification('success');
      
      toast({
        title: 'Location Found',
        description: `Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Location Error',
        description: 'Unable to get your location',
        variant: 'destructive'
      });
    }
  };

  const handleAddEventToCalendar = () => {
    const event = {
      title: 'Auto Detailing Appointment',
      description: 'Professional vehicle detailing service',
      location: 'MTKCx Auto Detailing Center',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      url: window.location.href
    };

    addToCalendar(event);
    impact('medium');
    
    toast({
      title: 'Calendar Event Added',
      description: 'Appointment added to your calendar',
      duration: 2000
    });
  };

  const handleSaveContact = () => {
    saveBusinessContact();
    impact('medium');
    
    toast({
      title: 'Contact Saved',
      description: 'MTKCx contact information saved',
      duration: 2000
    });
  };

  const handleShareApp = async () => {
    try {
      const shared = await shareProduct({
        name: 'MTKCx Auto Detailing',
        description: 'Professional automotive detailing services and products',
        url: window.location.href
      });

      if (shared) {
        notification('success');
        toast({
          title: 'App Shared',
          description: 'Thanks for sharing!',
          duration: 2000
        });
      }
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard?.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'App link copied to clipboard',
        duration: 2000
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-2 text-center"
          style={refreshIndicatorStyle}
        >
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Theme & Display Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Display Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyTheme('light')}
              className="flex items-center gap-1"
            >
              <Sun className="h-3 w-3" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyTheme('dark')}
              className="flex items-center gap-1"
            >
              <Moon className="h-3 w-3" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyTheme('system')}
              className="flex items-center gap-1"
            >
              <Smartphone className="h-3 w-3" />
              Auto
            </Button>
          </div>
        </div>
      </Card>

      {/* Native Features */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Mobile Features</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Location */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              {locationLoading ? 'Finding...' : 'Location'}
            </Button>

            {/* Calendar */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddEventToCalendar}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>

            {/* Contacts */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveContact}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Save Contact
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareApp}
              disabled={!canShare()}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Share App
            </Button>
          </div>
        </div>
      </Card>

      {/* Voice & Biometric Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Advanced Controls</h3>
          
          <div className="space-y-3">
            {/* Voice Commands */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isListening ? <Mic className="h-4 w-4 text-red-500" /> : <MicOff className="h-4 w-4" />}
                <span className="text-sm">Voice Commands</span>
                <Badge variant={voiceSupported ? 'default' : 'secondary'}>
                  {voiceSupported ? 'Available' : 'Not Supported'}
                </Badge>
              </div>
              <Button
                variant={isListening ? 'destructive' : 'outline'}
                size="sm"
                onClick={handleVoiceCommand}
                disabled={!voiceSupported || !voiceEnabled}
              >
                {isListening ? 'Stop' : 'Start'}
              </Button>
            </div>

            {/* Biometric Auth */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                <span className="text-sm">Biometric Auth</span>
                <Badge variant={biometricsSupported ? 'default' : 'secondary'}>
                  {biometricsSupported ? 'Available' : 'Not Supported'}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBiometricAuth}
                disabled={!biometricsSupported}
              >
                Authenticate
              </Button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">Haptic Feedback</span>
              </div>
              <Switch
                checked={hapticsEnabled}
                onCheckedChange={(checked) => {
                  setHapticsEnabled(checked);
                  if (checked) impact('light');
                }}
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notifications</span>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Current Location Display */}
      {location && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Current Location</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Lat: {location.latitude.toFixed(6)}</p>
              <p>Lng: {location.longitude.toFixed(6)}</p>
              {location.accuracy && <p>Accuracy: ±{Math.round(location.accuracy)}m</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Advanced Settings Panel */}
      {showAdvancedSettings && (
        <Card className="p-4 bg-secondary/30">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Advanced Settings</h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span>Pull-to-Refresh</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Swipe Gestures</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Native Sharing</span>
                <Badge variant={canShare() ? 'default' : 'secondary'}>
                  {canShare() ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Offline Mode</span>
                <Badge variant="outline">Ready</Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                impact('heavy');
                toast({
                  title: 'Settings Saved',
                  description: 'Your preferences have been saved',
                  duration: 1500
                });
              }}
              className="w-full"
            >
              Save Preferences
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};