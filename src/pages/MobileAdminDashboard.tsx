
import React from 'react';

const MobileAdminDashboardPage: React.FC = () => {
  console.log('🔥 MobileAdminDashboardPage: Starting to render');
  
  try {
    console.log('🔥 MobileAdminDashboardPage: About to return JSX');
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-black">
            🎉 MOBILE ADMIN DASHBOARD IS WORKING! 🎉
          </h1>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> The white screen issue has been resolved.
          </div>
          <div className="text-left bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">Debug Info:</h2>
            <p>✅ Route: /mobile-admin</p>
            <p>✅ Component: MobileAdminDashboardPage</p>
            <p>✅ Rendering: Successfully</p>
            <p>✅ Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('🔥 MobileAdminDashboardPage: Error rendering:', error);
    return (
      <div className="min-h-screen bg-red-50 p-4">
        <h1 className="text-xl font-bold text-red-600">Error in MobileAdminDashboardPage</h1>
        <p className="text-red-500">{String(error)}</p>
      </div>
    );
  }
};

export default MobileAdminDashboardPage;
