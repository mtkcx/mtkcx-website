import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { format } from 'date-fns';
import { Phone, Mail, Calendar, User, MapPin, Trash2 } from 'lucide-react';

interface EnrollmentRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  course_type: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const EnrollmentAdmin: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load enrollment requests',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === id ? { ...enrollment, status } : enrollment
        )
      );

      toast({
        title: 'Status Updated',
        description: `Enrollment status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to update status',
        variant: "destructive"
      });
    }
  };

  const deleteEnrollment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the enrollment request from ${name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollment_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEnrollments(prev => prev.filter(enrollment => enrollment.id !== id));

      toast({
        title: 'Enrollment Deleted',
        description: `Enrollment request from ${name} has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to delete enrollment request',
        variant: "destructive"
      });
    }
  };

  const saveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enrollment_requests')
        .update({ admin_notes: notesValue })
        .eq('id', id);

      if (error) throw error;

      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === id ? { ...enrollment, admin_notes: notesValue } : enrollment
        )
      );

      setEditingNotes(null);
      setNotesValue('');

      toast({
        title: 'Notes Saved',
        description: 'Admin notes updated successfully',
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to save notes',
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading enrollment requests...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Course Enrollment Requests</h1>
          <p className="text-muted-foreground">
            Manage and track enrollment requests for Koch Chemie training courses
          </p>
        </div>

        <div className="grid gap-6">
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No enrollment requests found</p>
              </CardContent>
            </Card>
          ) : (
            enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {enrollment.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(enrollment.status)}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {enrollment.course_type.replace('_', ' ')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteEnrollment(enrollment.id, enrollment.name)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{enrollment.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{enrollment.phone}</span>
                    </div>
                    {enrollment.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{enrollment.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(enrollment.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={enrollment.status === 'pending' ? 'default' : 'outline'}
                        onClick={() => updateStatus(enrollment.id, 'pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={enrollment.status === 'contacted' ? 'default' : 'outline'}
                        onClick={() => updateStatus(enrollment.id, 'contacted')}
                      >
                        Contacted
                      </Button>
                      <Button
                        size="sm"
                        variant={enrollment.status === 'enrolled' ? 'default' : 'outline'}
                        onClick={() => updateStatus(enrollment.id, 'enrolled')}
                      >
                        Enrolled
                      </Button>
                      <Button
                        size="sm"
                        variant={enrollment.status === 'declined' ? 'default' : 'outline'}
                        onClick={() => updateStatus(enrollment.id, 'declined')}
                      >
                        Declined
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Admin Notes:</label>
                        {editingNotes === enrollment.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => saveNotes(enrollment.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingNotes(null);
                                setNotesValue('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNotes(enrollment.id);
                              setNotesValue(enrollment.admin_notes || '');
                            }}
                          >
                            Edit Notes
                          </Button>
                        )}
                      </div>
                      
                      {editingNotes === enrollment.id ? (
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add admin notes..."
                          rows={3}
                        />
                      ) : (
                        <div className="bg-muted p-3 rounded-md min-h-[60px]">
                          <p className="text-sm text-muted-foreground">
                            {enrollment.admin_notes || 'No notes added yet'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EnrollmentAdmin;