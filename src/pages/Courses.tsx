import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  CheckCircle, 
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Users,
  Clock
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  const { toast } = useToast();

  const handleEnrollment = () => {
    toast({
      title: "Enrollment Interest Received!",
      description: "We'll contact you about the Koch Chemie Professional Detailing & Polishing Certification within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2">Professional Training</Badge>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
              Koch Chemie Professional
              <span className="text-gradient bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> Certification</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master both detailing and polishing techniques in our comprehensive 4-day certification program, 
              taught according to Koch Chemie's world-renowned standards and methodologies.
            </p>
          </div>
        </div>
      </section>

      {/* Main Course Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Detailing & Polishing Certification Course</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our comprehensive 4-day program combines interactive learning with hands-on training, 
                culminating in official Koch Chemie certification recognized industry-wide.
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Award className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Professional Certification Course</h3>
                      <p className="text-muted-foreground">4-Day Interactive & Hands-On Training</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">Contact for Pricing</div>
                    <div className="text-sm text-muted-foreground">Includes certification</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      What You'll Learn
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Professional detailing techniques and methodologies
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Advanced polishing methods and compound applications
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Koch Chemie product knowledge and proper usage
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Paint correction and restoration techniques
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Surface assessment and defect analysis
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Machine polishing mastery (rotary & dual-action)
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Quality control and finishing techniques
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Business practices and customer service excellence
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4 flex items-center">
                      <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                      4-Day Course Structure
                    </h4>
                    <div className="space-y-4">
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">Day 1: Fundamentals</h5>
                        <p className="text-sm text-muted-foreground">Koch Chemie product knowledge, surface analysis, and basic detailing techniques</p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">Day 2: Advanced Detailing</h5>
                        <p className="text-sm text-muted-foreground">Interior/exterior detailing mastery, protection applications, and quality standards</p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">Day 3: Polishing Mastery</h5>
                        <p className="text-sm text-muted-foreground">Paint correction, compound techniques, machine operation, and defect removal</p>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <h5 className="font-medium">Day 4: Certification</h5>
                        <p className="text-sm text-muted-foreground">Practical assessment, final projects, and official Koch Chemie certification</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Why Choose Our Koch Chemie Certification?
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">Official Certification</h5>
                      <p className="text-sm text-muted-foreground">Recognized Koch Chemie certification</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">Expert Instructors</h5>
                      <p className="text-sm text-muted-foreground">Certified Koch Chemie professionals</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <h5 className="font-medium mb-1">Interactive & Hands-On</h5>
                      <p className="text-sm text-muted-foreground">Real-world practical training</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-6 mb-8">
                  <h4 className="font-semibold mb-4">Course Includes:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Complete Koch Chemie product kit
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Professional polishing equipment access
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        All training materials and documentation
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Practice vehicles for hands-on training
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Official Koch Chemie certification
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Lunch and refreshments all 4 days
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Digital course materials and resources
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        Post-course support and guidance
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" onClick={handleEnrollment}>
                    <Calendar className="h-5 w-5 mr-2" />
                    Enroll Now
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact for Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Information */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Training Schedule */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-primary flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  Training Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">Course Duration:</span>
                    <span className="text-primary font-semibold">4 Days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">Training Format:</span>
                    <span className="text-primary font-semibold">Interactive & Hands-On</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">Class Size:</span>
                    <span className="text-primary font-semibold">Small Groups (Max 8)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">Location:</span>
                    <span className="text-primary font-semibold">Atarot Industrial Area</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
                    <span className="font-medium">Training Hours:</span>
                    <span className="text-primary font-semibold">10:00 AM - 6:00 PM</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Next Available Dates:
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Contact us to schedule your preferred training dates. 
                    We accommodate both individual and group bookings with flexible scheduling.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-primary">
                  Ready to Get Certified?
                </CardTitle>
                <p className="text-muted-foreground">
                  Contact us to discuss your training needs and reserve your spot in our next certification course
                </p>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-sm text-muted-foreground">052-5701-073</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-sm text-muted-foreground">info@mtkcx.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-background rounded-lg border">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Visit Us</p>
                      <p className="text-sm text-muted-foreground">Atarot Industrial Area, Jerusalem</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Koch Chemie Official Training</h4>
                  <p className="text-sm text-primary-foreground/90">
                    This is the only official Koch Chemie certification course in the region. 
                    Upon completion, you'll be a certified Koch Chemie professional detailer.
                  </p>
                </div>

                <Button className="w-full" size="lg" onClick={handleEnrollment}>
                  <Mail className="w-5 h-5 mr-2" />
                  Get Course Information
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;