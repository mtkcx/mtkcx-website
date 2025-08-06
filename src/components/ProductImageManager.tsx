import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProductVariant } from './ProductVariantManager';

export interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
  alt_text?: string;
  display_order: number;
  variant_id?: string;
}

interface ProductImageManagerProps {
  images: ProductImage[];
  variants: ProductVariant[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  variants,
  onImagesChange,
  maxImages = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleFileUpload = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages: ProductImage[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const url = await uploadImage(file);
        const newImage: ProductImage = {
          image_url: url,
          is_primary: images.length === 0 && newImages.length === 0,
          display_order: images.length + newImages.length,
          alt_text: file.name,
        };
        newImages.push(newImage);
      }

      onImagesChange([...images, ...newImages]);
      toast({
        title: "Images uploaded",
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If removing primary image, make first remaining image primary
    if (images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onImagesChange(newImages);
  };

  const assignImageToVariant = (index: number, variantId: string | null) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      variant_id: variantId || undefined,
    };
    onImagesChange(newImages);
  };

  const updateAltText = (index: number, altText: string) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      alt_text: altText,
    };
    onImagesChange(newImages);
  };

  const getVariantLabel = (variantId?: string) => {
    if (!variantId) return 'All Variants';
    const variant = variants.find(v => v.id === variantId);
    return variant ? `Size: ${variant.size}` : 'Unknown Variant';
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Product Images</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Upload images and assign them to specific variants. The first image will be the primary image.
        </p>
      </div>

      <Card
        className={`border-2 border-dashed p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drag & drop images here, or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  disabled={uploading || images.length >= maxImages}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
        </div>
      </Card>

      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Images</h4>
          <div className="grid gap-4">
            {images.map((image, index) => (
              <Card key={index} className="p-4">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || `Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => setPreviewImage(image.image_url)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {image.is_primary && (
                      <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>

                  {/* Image Settings */}
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label htmlFor={`alt-${index}`} className="text-sm">Alt Text</Label>
                        <input
                          id={`alt-${index}`}
                          type="text"
                          value={image.alt_text || ''}
                          onChange={(e) => updateAltText(index, e.target.value)}
                          placeholder="Describe this image"
                          className="w-full px-3 py-1 text-sm border rounded-md"
                        />
                      </div>
                      <div className="w-48">
                        <Label className="text-sm">Assign to Variant</Label>
                        <Select
                          value={image.variant_id || 'all'}
                          onValueChange={(value) => assignImageToVariant(index, value === 'all' ? null : value)}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Variants</SelectItem>
                            {variants.map((variant) => (
                              <SelectItem key={variant.id || `variant-${variant.size}`} value={variant.id || `variant-${variant.size}`}>
                                Size: {variant.size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge variant="outline" className="text-xs mt-1">
                          {getVariantLabel(image.variant_id)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!image.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrimaryImage(index)}
                          className="text-xs"
                        >
                          Set as Primary
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                        className="text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-muted-foreground">Uploading images...</div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl max-h-4xl p-4">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};