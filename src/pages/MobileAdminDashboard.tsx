
import React from 'react';
import { SimpleMobileAdminDashboard } from '@/components/mobile/SimpleMobileAdminDashboard';
import MobileAdminProtectedRoute from '@/components/mobile/MobileAdminProtectedRoute';
import SEOHead from '@/components/SEOHead';

const MobileAdminDashboardPage: React.FC = () => {
  console.log('MobileAdminDashboardPage rendering');

  return (
    <MobileAdminProtectedRoute>
      <SEOHead 
        title="Mobile Admin Dashboard - MTKCx"
        description="Mobile admin dashboard for managing MTKCx operations"
      />
      <div className="min-h-screen bg-background">
        <SimpleMobileAdminDashboard />
      </div>
    </MobileAdminProtectedRoute>
  );
};

export default MobileAdminDashboardPage;
