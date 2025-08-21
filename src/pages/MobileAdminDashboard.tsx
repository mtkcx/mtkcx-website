
import React from 'react';
import { MobileAdminDashboard } from '@/components/mobile/MobileAdminDashboard';
import MobileAdminProtectedRoute from '@/components/mobile/MobileAdminProtectedRoute';
import SEOHead from '@/components/SEOHead';
import { useAuth } from '@/contexts/AuthContext';

const MobileAdminDashboardPage: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <MobileAdminProtectedRoute>
      <SEOHead 
        title="Mobile Admin Dashboard - MTKCx"
        description="Mobile admin dashboard for managing MTKCx operations"
      />
      <div className="min-h-screen bg-background">
        <MobileAdminDashboard />
      </div>
    </MobileAdminProtectedRoute>
  );
};

export default MobileAdminDashboardPage;
