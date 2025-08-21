import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';

const SmartDashboardRedirect: React.FC = () => {
  const isMobile = useIsMobile();
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  console.log('SmartDashboardRedirect render:', { 
    isMobile, 
    isAdmin, 
    loading, 
    hasUser: !!user,
    redirecting 
  });

  useEffect(() => {
    console.log('SmartDashboardRedirect useEffect:', { loading, isMobile, isAdmin });
    
    // Wait for all states to be determined
    if (loading || isMobile === undefined) {
      console.log('Waiting for states to load...');
      return;
    }

    // Only redirect on mobile
    if (isMobile && !redirecting) {
      console.log('Mobile detected, preparing redirect...');
      setRedirecting(true);
      
      setTimeout(() => {
        if (isAdmin) {
          console.log('Redirecting admin to mobile-admin');
          navigate('/mobile-admin', { replace: true });
        } else {
          console.log('Redirecting user to mobile');
          navigate('/mobile', { replace: true });
        }
      }, 100);
    }
  }, [isMobile, isAdmin, loading, navigate, redirecting]);

  // Show loading while determining redirect or mobile detection
  if (loading || isMobile === undefined) {
    console.log('Showing loading state - loading:', loading, 'isMobile:', isMobile);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If mobile, show redirect message
  if (isMobile) {
    console.log('Showing mobile redirect state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Redirecting to mobile admin...' : 'Redirecting to mobile interface...'}
          </p>
        </div>
      </div>
    );
  }

  // Desktop users get the regular dashboard
  return <Dashboard />;
};

export default SmartDashboardRedirect;