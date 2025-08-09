import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Settings, FileText, Building, Phone, Mail, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

interface PageContent {
  id: string;
  page_name: string;
  section_name: string;
  content_key: string;
  content_value: string;
  content_type: string;
  display_order: number;
  is_active: boolean;
}

const WebsiteAdmin: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [pageContent, setPageContent] = useState<PageContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load site settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true });
      
      if (settingsError) throw settingsError;
      
      // Load page content
      const { data: contentData, error: contentError } = await supabase
        .from('page_content')
        .select('*')
        .order('page_name', { ascending: true });
      
      if (contentError) throw contentError;
      
      setSiteSettings(settingsData || []);
      setPageContent(contentData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load website content');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSiteSetting = async (settingKey: string, newValue: string) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey);
      
      if (error) throw error;
      
      // Update local state
      setSiteSettings(prev => 
        prev.map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, setting_value: newValue }
            : setting
        )
      );
      
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePageContent = async (id: string, newValue: string) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('page_content')
        .update({ content_value: newValue })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setPageContent(prev => 
        prev.map(content => 
          content.id === id 
            ? { ...content, content_value: newValue }
            : content
        )
      );
      
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingInput = (setting: SiteSetting) => {
    const handleSave = (value: string) => updateSiteSetting(setting.setting_key, value);
    
    if (setting.setting_type === 'textarea') {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.setting_key}>{setting.description}</Label>
          <Textarea
            id={setting.setting_key}
            defaultValue={setting.setting_value}
            onBlur={(e) => handleSave(e.target.value)}
            rows={3}
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <Label htmlFor={setting.setting_key}>{setting.description}</Label>
        <Input
          id={setting.setting_key}
          type={setting.setting_type === 'image' ? 'url' : 'text'}
          defaultValue={setting.setting_value}
          onBlur={(e) => handleSave(e.target.value)}
          placeholder={setting.setting_type === 'image' ? 'Enter image URL' : ''}
        />
      </div>
    );
  };

  const renderContentInput = (content: PageContent) => {
    const handleSave = (value: string) => updatePageContent(content.id, value);
    
    if (content.content_type === 'textarea') {
      return (
        <Textarea
          defaultValue={content.content_value}
          onBlur={(e) => handleSave(e.target.value)}
          rows={3}
        />
      );
    }
    
    return (
      <Input
        defaultValue={content.content_value}
        onBlur={(e) => handleSave(e.target.value)}
      />
    );
  };

  const groupedSettings = siteSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  const groupedContent = pageContent.reduce((acc, content) => {
    if (!acc[content.page_name]) {
      acc[content.page_name] = [];
    }
    acc[content.page_name].push(content);
    return acc;
  }, {} as Record<string, PageContent[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Website Content Management</h1>
          <p className="text-muted-foreground">Edit your website content and settings</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="footer" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Footer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedSettings.general?.map((setting) => (
                  <div key={setting.setting_key}>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedSettings.company?.map((setting) => (
                  <div key={setting.setting_key}>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            {Object.entries(groupedContent).map(([pageName, contents]) => (
              <Card key={pageName}>
                <CardHeader>
                  <CardTitle className="capitalize">{pageName} Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contents.map((content) => (
                    <div key={content.id} className="space-y-2">
                      <Label className="text-sm font-medium capitalize">
                        {content.section_name} - {content.content_key.replace('_', ' ')}
                      </Label>
                      {renderContentInput(content)}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedSettings.footer?.map((setting) => (
                  <div key={setting.setting_key}>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WebsiteAdmin;