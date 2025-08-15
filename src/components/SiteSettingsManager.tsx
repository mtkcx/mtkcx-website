import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Globe, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/contexts/SEOContext';

const SiteSettingsManager: React.FC = () => {
  const { seoSettings, refreshSEOSettings } = useSEO();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    site_title: seoSettings.site_title,
    site_description: seoSettings.site_description,
    site_keywords: seoSettings.site_keywords,
    favicon_url: seoSettings.favicon_url,
    og_image_url: seoSettings.og_image_url
  });

  // Update form when seoSettings change
  React.useEffect(() => {
    setFormData({
      site_title: seoSettings.site_title,
      site_description: seoSettings.site_description,
      site_keywords: seoSettings.site_keywords,
      favicon_url: seoSettings.favicon_url,
      og_image_url: seoSettings.og_image_url
    });
  }, [seoSettings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'seo_settings',
          setting_value: JSON.stringify(formData),
          category: 'seo',
          description: 'Site SEO and branding settings',
          setting_type: 'json',
        });

      if (error) throw error;

      // Refresh the SEO context to update all components
      await refreshSEOSettings();
      
      toast({ 
        title: "Success", 
        description: "Site settings saved successfully! Title and favicon have been updated." 
      });
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save site settings", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newFaviconUrl = data.publicUrl;
      setFormData(prev => ({ ...prev, favicon_url: newFaviconUrl }));
      
      toast({ 
        title: "Success", 
        description: "Favicon uploaded successfully! Don't forget to save settings." 
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({ 
        title: "Error", 
        description: "Failed to upload favicon", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `og-image-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newImageUrl = data.publicUrl;
      setFormData(prev => ({ ...prev, og_image_url: newImageUrl }));
      
      toast({ 
        title: "Success", 
        description: "Social media image uploaded successfully! Don't forget to save settings." 
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ 
        title: "Error", 
        description: "Failed to upload image", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Site Settings
        </CardTitle>
        <CardDescription>
          Manage your website's basic information, title, and branding elements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Site Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={formData.site_title}
                onChange={(e) => setFormData(prev => ({ ...prev, site_title: e.target.value }))}
                placeholder="Your site title (appears in browser tab)"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This appears in the browser tab and search results
              </p>
            </div>

            <div>
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={formData.site_description}
                onChange={(e) => setFormData(prev => ({ ...prev, site_description: e.target.value }))}
                placeholder="Describe your website for search engines"
                rows={3}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Used for search engine results and social media previews
              </p>
            </div>

            <div>
              <Label htmlFor="site_keywords">Keywords</Label>
              <Input
                id="site_keywords"
                value={formData.site_keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, site_keywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Comma-separated keywords for SEO
              </p>
            </div>
          </div>

          {/* Branding Elements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Branding Elements</h3>
            
            {/* Favicon Section */}
            <div>
              <Label>Favicon</Label>
              <div className="mt-2 space-y-2">
                {formData.favicon_url && (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <img 
                      src={formData.favicon_url} 
                      alt="Current favicon" 
                      className="w-6 h-6"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="text-sm">Current favicon</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/png,image/jpg,image/jpeg,image/svg+xml';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFaviconUpload(file);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {isUploading ? 'Uploading...' : 'Upload Favicon'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, or SVG files recommended. 32x32px or larger.
                </p>
              </div>
            </div>

            {/* Social Media Image */}
            <div>
              <Label>Social Media Image</Label>
              <div className="mt-2 space-y-2">
                {formData.og_image_url && (
                  <div className="border rounded p-2">
                    <img 
                      src={formData.og_image_url} 
                      alt="Social media preview" 
                      className="w-full max-w-xs h-auto rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Current social media image</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload(file);
                      };
                      input.click();
                    }}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used when sharing your site on social media. 1200x630px recommended.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={loading || isUploading}
            size="lg"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Help Section */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Quick Help</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Changes to title and favicon take effect immediately after saving</li>
            <li>• Keep your title under 60 characters for best SEO results</li>
            <li>• Description should be 150-160 characters for optimal display</li>
            <li>• Keywords should be relevant to your content and separated by commas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsManager;