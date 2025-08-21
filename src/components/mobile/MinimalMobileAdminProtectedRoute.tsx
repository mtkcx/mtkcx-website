import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, AlertTriangle, LogIn } from 'lucide-react';

interface MinimalMobileAdminProtectedRouteProps {
  children: React.ReactNode;
}

const MinimalMobileAdminProtectedRoute: React.FC<MinimalMobileAdminProtectedRouteProps> = ({ 
  children
}) => {
  console.log('MinimalMobileAdminProtectedRoute rendering...');
  
  // For now, just render children without any auth checks to debug the white screen
  // This will help us isolate if the issue is with auth or with the dashboard component itself
  
  return (
    <div className="relative min-h-screen bg-background">
      {/* Admin Badge */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </div>
      </div>
      {children}
    </div>
  );
};

export default MinimalMobileAdminProtectedRoute;