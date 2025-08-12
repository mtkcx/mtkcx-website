import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useOfflineProducts } from '@/hooks/useOfflineCache';
import { usePerformanceMonitor } from '@/hooks/usePerformance';
import { useToast } from '@/hooks/use-toast';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = false,
  compact = false
}) => {
  const { 
    syncProducts, 
    getProducts, 
    loading, 
    error, 
    isOnline, 
    cacheSize 
  } = useOfflineProducts();
  
  const { metrics, performanceScore } = usePerformanceMonitor();
  const { toast } = useToast();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);

  useEffect(() => {
    const cachedData = getProducts();
    if (cachedData?.lastSync) {
      setLastSync(new Date(cachedData.lastSync));
    }
  }, [getProducts]);

  const handleForceSync = async () => {
    try {
      const result = await syncProducts(true);
      if (result) {
        setLastSync(new Date(result.lastSync));
        toast({
          title: 'Sync Complete',
          description: `Updated ${result.products.length} products and ${result.categories.length} categories`
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Unable to sync data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getConnectionStatus = () => {
    if (isOnline) {
      return {
        icon: Wifi,
        text: 'Online',
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200'
      };
    } else {
      return {
        icon: WifiOff,
        text: 'Offline',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200'
      };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon className={`h-4 w-4 ${status.color}`} />
        {!isOnline && (
          <Badge variant="outline" className="text-xs">
            Offline Mode
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <Card className={`p-3 ${status.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            <div>
              <p className={`font-medium ${status.color}`}>{status.text}</p>
              {lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {formatTimeAgo(lastSync)}
                </p>
              )}
            </div>
          </div>
          
          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceSync}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
        </div>
        
        {loading && (
          <div className="mt-2">
            <Progress value={75} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">Syncing data...</p>
          </div>
        )}
        
        {error && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </Card>

      {/* Cache Information */}
      {showDetails && (
        <Card className="p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Offline Storage</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPerformance(!showPerformance)}
                className="h-6 px-2 text-xs"
              >
                <Activity className="h-3 w-3 mr-1" />
                Performance
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3 text-blue-500" />
                <div>
                  <p className="font-medium">Cache Size</p>
                  <p className="text-muted-foreground">{cacheSize} items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-orange-500" />
                <div>
                  <p className="font-medium">Data Age</p>
                  <p className="text-muted-foreground">
                    {lastSync ? formatTimeAgo(lastSync) : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {showPerformance && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Performance Score</span>
                  <span className="text-xs">{performanceScore}/100</span>
                </div>
                <Progress value={performanceScore} className="h-1" />
                
                {metrics.lcp && (
                  <div className="flex items-center justify-between text-xs">
                    <span>Load Time</span>
                    <span className={metrics.lcp > 2500 ? 'text-red-500' : 'text-green-500'}>
                      {(metrics.lcp / 1000).toFixed(1)}s
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Offline Capabilities */}
      {!isOnline && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Offline Mode Active</p>
              <p className="text-xs text-blue-700 mt-1">
                You can still browse products and view cached content. 
                New orders and quotes will be saved when you're back online.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};