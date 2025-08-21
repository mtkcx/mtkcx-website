import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Clock, X } from 'lucide-react';
import { SecurityAuditLogger, SessionSecurityManager } from '@/utils/enhanced-security';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
}

const SecurityMonitor: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setIsMonitoring(true);
      
      // Initialize session timeout monitoring
      SessionSecurityManager.initializeSessionTimeout(
        () => {
          // Session timeout - force logout
          toast({
            title: 'Session Expired',
            description: 'Your session has expired for security reasons. Please sign in again.',
            variant: 'destructive',
          });
          signOut();
        },
        () => {
          // Session warning
          setShowSessionWarning(true);
          toast({
            title: 'Session Warning',
            description: 'Your session will expire in 10 minutes. Click to extend.',
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSessionWarning(false);
                  toast({
                    title: 'Session Extended',
                    description: 'Your session has been extended.',
                  });
                }}
              >
                Extend Session
              </Button>
            ),
          });
        }
      );

      // Load existing security events
      loadSecurityEvents();

      // Set up periodic monitoring
      const interval = setInterval(loadSecurityEvents, 30000); // Check every 30 seconds

      return () => {
        clearInterval(interval);
        SessionSecurityManager.clearTimeout();
      };
    } else {
      setIsMonitoring(false);
      SessionSecurityManager.clearTimeout();
    }
  }, [user, signOut, toast]);

  const loadSecurityEvents = () => {
    const events = SecurityAuditLogger.getSecurityLogs();
    setSecurityEvents(events.slice(-10)); // Show last 10 events
  };

  const getSeverityColor = (severity: string): "default" | "secondary" | "destructive" | "warning" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <Shield className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isMonitoring) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Session Warning Alert */}
      {showSessionWarning && (
        <Alert className="mb-4 border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning-foreground" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-warning-foreground">Session expiring soon!</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowSessionWarning(false);
                  // Reset session timeout
                  window.location.reload();
                }}
              >
                Extend
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSessionWarning(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events Monitor (only show if there are recent high-severity events) */}
      {securityEvents.some(event => ['high', 'critical'].includes(event.severity)) && (
        <Card className="bg-background/95 backdrop-blur-sm border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-destructive" />
              Security Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {securityEvents
              .filter(event => ['high', 'critical'].includes(event.severity))
              .slice(-3)
              .map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {getSeverityIcon(event.severity)}
                  <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                    {event.severity}
                  </Badge>
                  <span className="flex-1 truncate">{event.event}</span>
                </div>
              ))}
            <div className="text-xs text-muted-foreground mt-2">
              Security events are being monitored
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityMonitor;