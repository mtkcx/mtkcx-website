
import React from 'react';
import { MinimalMobileAdminDashboard } from '@/components/mobile/MinimalMobileAdminDashboard';
import MinimalMobileAdminProtectedRoute from '@/components/mobile/MinimalMobileAdminProtectedRoute';

const MobileAdminDashboardPage: React.FC = () => {
  console.log('MobileAdminDashboardPage rendering...');
  
  return (
    <MinimalMobileAdminProtectedRoute>
      <MinimalMobileAdminDashboard />
    </MinimalMobileAdminProtectedRoute>
  );
};

export default MobileAdminDashboardPage;
