import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SimpleMobileAdminDashboard: React.FC = () => {
  console.log('SimpleMobileAdminDashboard rendered successfully');
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Badge className="mb-4">Mobile Admin Dashboard</Badge>
          <h1 className="text-2xl font-bold text-primary">Admin Control Panel</h1>
          <p className="text-muted-foreground mt-2">
            Simplified mobile admin interface
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-muted-foreground text-sm">Total orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-muted-foreground text-sm">Pending quotes</p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Content */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Mobile Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a simplified mobile admin dashboard. All features are loading correctly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};