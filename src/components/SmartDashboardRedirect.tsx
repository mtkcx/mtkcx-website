import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';

const SmartDashboardRedirect: React.FC = () => {
  console.log('SmartDashboardRedirect component loaded');
  
  const isMobile = useIsMobile();
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();

  console.log('Current state:', { 
    isMobile, 
    isAdmin, 
    loading, 
    hasUser: !!user 
  });

  // Force redirect on mobile immediately
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    
    console.log('Mobile detection:', { isMobile, isMobileDevice, userAgent });
    
    if (isMobileDevice || window.innerWidth < 768) {
      console.log('Detected mobile, redirecting...');
      if (isAdmin) {
        console.log('Redirecting to /mobile-admin');
        navigate('/mobile-admin', { replace: true });
      } else {
        console.log('Redirecting to /mobile');
        navigate('/mobile', { replace: true });
      }
    }
  }, [isAdmin, navigate]);

  if (loading) {
    console.log('Auth loading, showing spinner');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading auth...</p>
        </div>
      </div>
    );
  }

  // Show desktop dashboard for non-mobile
  console.log('Showing desktop dashboard');
  return <Dashboard />;
};

export default SmartDashboardRedirect;