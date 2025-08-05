import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  User,
  Building,
  Car,
  Package,
  GraduationCap,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    serviceInterest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        serviceInterest: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: "052-5701-073",
      description: "Call us during business hours"
    },
    {
      icon: Mail,
      title: "Email",
      details: "info@mtkcx.com",
      description: "We respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Atarot Industrial Area, Hatamrukim, Jerusalem",
      description: "Visit our showroom and workshop"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Sunday - Thursday: 10:00 AM - 6:00 PM",
      description: "Fridays are off"
    }
  ];

  const services = [
    { value: "products", label: "Koch-Chemie Products", icon: Package },
    { value: "training", label: "Detailing Training", icon: GraduationCap },
    { value: "wrapping", label: "Vehicle Wrapping", icon: Car },
    { value: "consultation", label: "Professional Consultation", icon: MessageSquare },
    { value: "other", label: "Other Services", icon: Building }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 px-4 py-2">Get In Touch</Badge>
            <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
              Contact MT Wraps
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ready to elevate your automotive care experience? Get in touch with our expert team 
              for products, training, or professional wrapping services.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-2xl font-bold text-primary flex items-center">
                    <Send className="w-6 h-6 mr-3" />
                    Send us a Message
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                
                <CardContent className="px-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+972 XX-XXXX-XXX"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company" className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          Company/Business
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="Your business name"
                        />
                      </div>
                    </div>

                    {/* Service Interest */}
                    <div className="space-y-2">
                      <Label htmlFor="serviceInterest">Service of Interest</Label>
                      <select
                        id="serviceInterest"
                        name="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select a service...</option>
                        {services.map((service) => (
                          <option key={service.value} value={service.value}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder="Please provide details about your inquiry, project requirements, or questions..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              
              {/* Contact Details */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-primary">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{info.title}</h3>
                          <p className="text-sm font-medium text-primary">{info.details}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Services Quick Reference */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-primary">
                    Our Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  {services.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span className="text-sm">{service.label}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card className="p-6 bg-primary/5">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-bold text-primary">
                    Why Choose MT Wraps?
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Official Koch-Chemie Partner</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Professional Training Programs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Expert Wrapping Services</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Fast Response Time</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">Visit Our Location</h2>
            <p className="text-muted-foreground">
              Come see our showroom and workshop at Atarot Industrial Area
            </p>
          </div>
          
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Atarot Industrial Area</h3>
              <p className="text-muted-foreground">Hatamrukim, Jerusalem</p>
              <p className="text-sm text-muted-foreground mt-2">Interactive map coming soon</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;