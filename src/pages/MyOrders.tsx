import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import SEOHead from '@/components/SEOHead';

const MyOrders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SEOHead 
        title="My Orders - MT Wraps Order History"
        description="View your order history, track purchases, and see your most purchased products with MT Wraps."
        keywords="order history, track orders, purchase history, MT Wraps orders"
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className="mb-4 px-4 py-2">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Order Management
              </Badge>
              <h1 className="text-4xl font-bold text-primary mb-4">
                My Orders
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Track your orders, view purchase history, and see your favorite products
              </p>
            </div>

            {/* Customer Dashboard */}
            <CustomerDashboard />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default MyOrders;