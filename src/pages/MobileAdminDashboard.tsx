import React from 'react';
import { MobileAdminDashboard } from '@/components/mobile/MobileAdminDashboard';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import SEOHead from '@/components/SEOHead';

const MobileAdminDashboardPage: React.FC = () => {
  return (
    <AdminProtectedRoute>
      <SEOHead 
        title="Mobile Admin Dashboard - MTKCx"
        description="Mobile admin dashboard for managing MTKCx operations"
      />
      <div className="min-h-screen bg-background">
        <MobileAdminDashboard />
      </div>
    </AdminProtectedRoute>
  );
};

export default MobileAdminDashboardPage;