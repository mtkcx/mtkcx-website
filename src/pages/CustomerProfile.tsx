import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Calendar, 
  Edit3,
  Save,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import SEOHead from '@/components/SEOHead';

const CustomerProfile = () => {
  const { user, profile, loading, updateProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: 'Israel'
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company: profile.company || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Israel'
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        company: profile.company || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Israel'
      });
    }
    setIsEditing(false);
  };

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
        title="My Profile - MT Wraps Customer Portal"
        description="Manage your profile information and view your order history with MT Wraps."
        keywords="customer profile, order history, MT Wraps account"
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className="mb-4 px-4 py-2">
                Customer Portal
              </Badge>
              <h1 className="text-4xl font-bold text-primary mb-4">
                Welcome, {profile?.full_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your profile information and track your orders
              </p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Information
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Orders & History
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Card */}
                  <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center">
                              <User className="w-5 h-5 mr-2" />
                              Profile Information
                            </CardTitle>
                            <CardDescription>
                              Update your personal information and contact details
                            </CardDescription>
                          </div>
                          {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button onClick={handleCancel} variant="outline" size="sm">
                                Cancel
                              </Button>
                              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            {isEditing ? (
                              <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                              />
                            ) : (
                              <p className="text-sm p-3 bg-muted rounded-md">
                                {formData.full_name || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <p className="text-sm p-3 bg-muted rounded-md">
                              {user.email}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            {isEditing ? (
                              <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                              />
                            ) : (
                              <p className="text-sm p-3 bg-muted rounded-md">
                                {formData.phone || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            {isEditing ? (
                              <Input
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="Enter your company name"
                              />
                            ) : (
                              <p className="text-sm p-3 bg-muted rounded-md">
                                {formData.company || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            {isEditing ? (
                              <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your address"
                              />
                            ) : (
                              <p className="text-sm p-3 bg-muted rounded-md">
                                {formData.address || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            {isEditing ? (
                              <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Enter your city"
                              />
                            ) : (
                              <p className="text-sm p-3 bg-muted rounded-md">
                                {formData.city || 'Not provided'}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            {isEditing ? (
                              <Input
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Enter your country"
                              />
                            ) : (
                              <p className="text-sm p-3 bg-muted rounded-md">
                                {formData.country || 'Not provided'}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Summary */}
                  <div className="lg:col-span-1">
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Account Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Member Since</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Account Status</p>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Active Customer
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <CustomerDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CustomerProfile;