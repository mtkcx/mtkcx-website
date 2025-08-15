import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  favicon_url: string;
  og_image_url: string;
}

const SEOManager: React.FC = () => {
  const [settings, setSettings] = useState<SEOSettings>({
    site_title: 'MTKCx | Koch-Chemie Distribution Partner',
    site_description: 'Official Koch-Chemie distributor offering premium German car detailing products, professional training courses, and expert car wrapping services. Shop authentic Koch-Chemie products online.',
    site_keywords: 'koch chemie, car detailing, automotive cleaning, professional car care, german car products, car wrapping, detailing training, MT Wraps',
    favicon_url: '/favicon.png',
    og_image_url: 'https://kochchemie-east-hub.lovable.app/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png'
  });
  
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'seo_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.setting_value) {
        const seoData = JSON.parse(data.setting_value as string);
        setSettings(seoData);
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'seo_settings',
          setting_value: JSON.stringify(settings),
          category: 'seo',
          description: 'SEO configuration including title, description, keywords, favicon and og image',
          setting_type: 'json',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('SEO settings saved successfully! Note: Changes to title and favicon require a page refresh to take effect.');
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast.error('Failed to save SEO settings');
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
      setSettings(prev => ({ ...prev, favicon_url: newFaviconUrl }));
      toast.success('Favicon uploaded successfully!');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast.error('Failed to upload favicon');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOGImageUpload = async (file: File) => {
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

      const newOGImageUrl = data.publicUrl;
      setSettings(prev => ({ ...prev, og_image_url: newOGImageUrl }));
      toast.success('OpenGraph image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading OG image:', error);
      toast.error('Failed to upload OpenGraph image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          SEO Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              value={settings.site_title}
              onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
              placeholder="Enter site title (appears in browser tab)"
            />
          </div>

          <div>
            <Label htmlFor="site_description">Meta Description</Label>
            <Textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
              placeholder="Enter meta description for search engines (max 160 characters)"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {settings.site_description.length}/160 characters
            </p>
          </div>

          <div>
            <Label htmlFor="site_keywords">SEO Keywords</Label>
            <Input
              id="site_keywords"
              value={settings.site_keywords}
              onChange={(e) => setSettings(prev => ({ ...prev, site_keywords: e.target.value }))}
              placeholder="Enter comma-separated keywords"
            />
          </div>

          <div>
            <Label>Favicon</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {settings.favicon_url && (
                  <img
                    src={settings.favicon_url}
                    alt="Current favicon"
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <Input
                  value={settings.favicon_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, favicon_url: e.target.value }))}
                  placeholder="Favicon URL (or upload below)"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFaviconUpload(file);
                  }}
                  className="hidden"
                  id="favicon-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('favicon-upload')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Favicon'}
                </Button>
                <p className="text-sm text-muted-foreground">PNG or ICO recommended, 32x32px or 16x16px</p>
              </div>
            </div>
          </div>

          <div>
            <Label>OpenGraph Image (Social Media Preview)</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {settings.og_image_url && (
                  <img
                    src={settings.og_image_url}
                    alt="Current OG image"
                    className="w-16 h-9 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <Input
                  value={settings.og_image_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, og_image_url: e.target.value }))}
                  placeholder="OpenGraph image URL (or upload below)"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleOGImageUpload(file);
                  }}
                  className="hidden"
                  id="og-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('og-image-upload')?.click()}
                  disabled={isUploading}
                >
                  <Image className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload OG Image'}
                </Button>
                <p className="text-sm text-muted-foreground">Recommended: 1200x630px for best social media display</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save SEO Settings'}
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Important Notes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Changes to title and favicon require a browser refresh to take effect</li>
            <li>• Favicon should be PNG format for best compatibility</li>
            <li>• OpenGraph images appear when sharing on social media</li>
            <li>• Meta description should be under 160 characters for best SEO</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOManager;