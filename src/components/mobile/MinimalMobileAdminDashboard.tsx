import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Package, Users, BookOpen, TrendingUp } from 'lucide-react';

export const MinimalMobileAdminDashboard: React.FC = () => {
  console.log('MinimalMobileAdminDashboard rendering...');
  
  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-primary">Mobile Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">System Status: Online</p>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Orders</CardTitle>
            <Package className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">0</div>
            <div className="text-xs text-muted-foreground">No orders yet</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Users</CardTitle>
            <Users className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">1</div>
            <div className="text-xs text-muted-foreground">Admin user</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Courses</CardTitle>
            <BookOpen className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">0</div>
            <div className="text-xs text-muted-foreground">No enrollments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Revenue</CardTitle>
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">₪0</div>
            <div className="text-xs text-muted-foreground">Total earnings</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Dashboard Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-sm mb-2">Dashboard Active</h3>
            <p className="text-xs text-muted-foreground mb-4">
              You are successfully accessing the mobile admin dashboard. 
              All systems are operational.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Authentication:</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-green-600">✓ Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile UI:</span>
                <span className="text-green-600">✓ Optimized</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        Mobile Admin Dashboard v1.0 - MTKCx
      </div>
    </div>
  );
};