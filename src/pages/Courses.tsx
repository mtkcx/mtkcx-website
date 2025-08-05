import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  duration: string;
  participants: string;
  price: string;
  includes: string[];
  features: string[];
  featured: boolean;
  certification: boolean;
}

const Courses = () => {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses: Course[] = [
    {
      id: 'basic-detailing',
      title: 'Basic Car Detailing',
      subtitle: 'Master the fundamentals of professional car care',
      description: 'Perfect for beginners wanting to learn proper car detailing techniques using Koch-Chemie products. Covers washing, drying, and basic protection methods.',
      level: 'Beginner',
      duration: '1 Day (8 hours)',
      participants: 'Max 8 students',
      price: 'Contact for pricing',
      includes: [
        'Koch-Chemie product kit',
        'Professional microfiber towels',
        'Lunch and refreshments',
        'Digital course materials',
        'Certificate of completion'
      ],
      features: [
        'Proper washing techniques',
        'Paint inspection basics',
        'Interior cleaning methods',
        'Tool usage and safety',
        'Product selection guide'
      ],
      featured: false,
      certification: true
    },
    {
      id: 'advanced-polishing',
      title: 'Advanced Paint Correction',
      subtitle: 'Professional polishing and paint restoration',
      description: 'Intensive training in paint correction, scratch removal, and advanced polishing techniques. Learn to use rotary and dual-action polishers professionally.',
      level: 'Advanced',
      duration: '2 Days (16 hours)',
      participants: 'Max 6 students',
      price: 'Contact for pricing',
      includes: [
        'Professional polishing kit',
        'Koch-Chemie compounds & polishes',
        'Practice panels',
        'All meals included',
        'Professional certification',
        'Follow-up support'
      ],
      features: [
        'Paint defect analysis',
        'Machine polishing mastery',
        'Compound selection',
        'Business application',
        'Quality control methods'
      ],
      featured: true,
      certification: true
    },
    {
      id: 'business-detailing',
      title: 'Professional Detailing Business',
      subtitle: 'Start and grow your detailing business',
      description: 'Comprehensive business training covering technical skills, business setup, pricing strategies, and customer management for aspiring detailing entrepreneurs.',
      level: 'Intermediate',
      duration: '3 Days (24 hours)',
      participants: 'Max 10 students',
      price: 'Contact for pricing',
      includes: [
        'Complete startup kit',
        'Business planning templates',
        'Marketing materials',
        'Koch-Chemie dealer application',
        'Ongoing mentorship',
        'Business certification'
      ],
      features: [
        'Business setup guidance',
        'Pricing strategies',
        'Customer acquisition',
        'Quality systems',
        'Supplier relationships'
      ],
      featured: false,
      certification: true
    },
    {
      id: 'master-class',
      title: 'Master Detailer Certification',
      subtitle: 'The ultimate professional certification program',
      description: 'Elite level training covering all aspects of professional detailing, business management, and instructor qualification. Become a certified Koch-Chemie master detailer.',
      level: 'Master',
      duration: '5 Days (40 hours)',
      participants: 'Max 4 students',
      price: 'Contact for pricing',
      includes: [
        'Professional equipment package',
        'Complete Koch-Chemie range',
        'Instructor certification',
        'Business license support',
        'Lifetime updates',
        'Master certification'
      ],
      features: [
        'Advanced techniques',
        'Instructor qualification',
        'Business mastery',
        'Quality certification',
        'Industry recognition'
      ],
      featured: true,
      certification: true
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Professional Certification',
      description: 'Receive official Koch-Chemie certification recognized industry-wide'
    },
    {
      icon: Users,
      title: 'Expert Instructors',
      description: 'Learn from certified professionals with years of hands-on experience'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Materials',
      description: 'All course materials, products, and tools included in training'
    },
    {
      icon: Target,
      title: 'Practical Training',
      description: 'Hands-on learning with real vehicles and professional equipment'
    }
  ];

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnrollment = (courseId: string, courseTitle: string) => {
    toast({
      title: "Enrollment Interest Received!",
      description: `We'll contact you about the ${courseTitle} course within 24 hours.`,
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
              Detailing & Polishing
              <span className="text-gradient bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> Courses</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Master professional car detailing with our comprehensive training programs. 
              Learn from certified experts and gain official Koch-Chemie certification.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Why Choose Our Training?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional development that advances your career and business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Available Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect course for your skill level and career goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  course.featured ? 'border-primary border-2' : 'border-2 hover:border-primary/20'
                }`}
              >
                {course.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-primary mb-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-muted-foreground mb-3">{course.subtitle}</p>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Course Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-primary mr-2" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 text-primary mr-2" />
                      <span>{course.participants}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Award className="w-4 h-4 text-primary mr-2" />
                      <span>{course.certification ? 'Certified' : 'No Certification'}</span>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-primary">
                      <span>{course.price}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Course Features */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">What You'll Learn:</h4>
                    <div className="space-y-2">
                      {course.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Includes */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Course Includes:</h4>
                    <div className="space-y-2">
                      {course.includes.map((item, index) => (
                        <div key={index} className="flex items-center text-sm text-muted-foreground">
                          <Sparkles className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enrollment Button */}
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => handleEnrollment(course.id, course.title)}
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Training Schedule & Contact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
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
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Course Days:</span>
                    <span className="text-primary">Sunday - Thursday</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Training Hours:</span>
                    <span className="text-primary">10:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Location:</span>
                    <span className="text-primary">Atarot Industrial Area</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Class Size:</span>
                    <span className="text-primary">Small Groups Only</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Next Available Dates:</h4>
                  <p className="text-sm text-muted-foreground">
                    Contact us to schedule your preferred training dates. 
                    We accommodate both individual and group bookings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Enrollment */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-primary">
                  Ready to Start Learning?
                </CardTitle>
                <p className="text-muted-foreground">
                  Contact us to discuss your training needs and schedule your course
                </p>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-sm text-muted-foreground">052-5701-073</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-sm text-muted-foreground">info@mtkcx.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Visit Us</p>
                      <p className="text-sm text-muted-foreground">Atarot Industrial Area, Jerusalem</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Special Offer</h4>
                  <p className="text-sm text-primary-foreground/90">
                    Book multiple courses together and save! Ask about our 
                    group discounts and business packages.
                  </p>
                </div>

                <Button className="w-full" size="lg" variant="outline">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact for Enrollment
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