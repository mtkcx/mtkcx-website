import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';

const SmartDashboardRedirect: React.FC = () => {
  const isMobile = useIsMobile();
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for all states to be determined
    if (loading || isMobile === undefined) return;
    
    if (isMobile && isAdmin) {
      // Redirect mobile admin users to mobile admin dashboard
      navigate('/mobile-admin', { replace: true });
    } else if (isMobile) {
      // Redirect mobile regular users to mobile app
      navigate('/mobile', { replace: true });
    }
    // Desktop users stay on this component and see the regular Dashboard
  }, [isMobile, isAdmin, loading, navigate]);

  // Show loading while determining redirect or mobile detection
  if (loading || isMobile === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If mobile, show minimal loading while redirect happens
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Redirecting to mobile interface...</p>
        </div>
      </div>
    );
  }

  // Desktop users get the regular dashboard
  return <Dashboard />;
};

export default SmartDashboardRedirect;