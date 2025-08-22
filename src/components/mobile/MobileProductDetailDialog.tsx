import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Eye, 
  Star, 
  Package, 
  Shield,
  Sparkles,
  Zap,
  Heart,
  Info
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  selectedVariants: Record<string, { variantId: string; size: string; price: number }>;
  onVariantChange: (productId: string, variantId: string, size: string, price: number) => void;
  getCurrentProductImage: (product: any) => string;
}

export const MobileProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  product,
  isOpen,
  onClose,
  selectedVariants,
  onVariantChange,
  getCurrentProductImage
}) => {
  const { addToCart: addItemToCart } = useCart();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);

  // Debug logging
  console.log('MobileProductDetailDialog rendered with:', { product, isOpen });

  if (!product) {
    console.log('No product provided to dialog');
    return null;
  }

  // Get localized content
  const getLocalizedContent = (field: string) => {
    const baseField = product[field];
    const arField = product[`${field}_ar`];
    const heField = product[`${field}_he`];

    switch (currentLanguage) {
      case 'ar':
        return arField || baseField || '';
      case 'he':
        return heField || baseField || '';
      default:
        return baseField || '';
    }
  };

  const productName = getLocalizedContent('name');
  const productDescription = getLocalizedContent('description');

  // Get all product images
  const productImages = product.product_images?.length > 0 
    ? product.product_images.map((img: any) => img.image_url)
    : [product.image_url || getCurrentProductImage(product)];

  const selectedVariant = selectedVariants[product.id];

  const addToCart = () => {
    if (!selectedVariant && product.product_variants?.length > 0) {
      toast({
        title: t('mobile.products.select_size'),
        description: t('mobile.products.select_size_desc'),
        variant: 'destructive'
      });
      return;
    }

    const cartItem = {
      productId: product.id,
      productName: productName,
      productCode: product.product_code,
      variantId: selectedVariant?.variantId || null,
      variantSize: selectedVariant?.size || 'default',
      price: selectedVariant?.price || parseFloat(product.product_variants?.[0]?.price || '0'),
      quantity: 1,
      imageUrl: getCurrentProductImage(product),
      categoryName: product.product_categories?.[0]?.categories?.name || 'Unknown'
    };

    addItemToCart(cartItem);
    
    toast({
      title: t('mobile.products.added_to_cart'),
      description: `${productName} ${t('mobile.products.added_description')}`,
      duration: 2000
    });

    onClose();
  };

  const handleVariantChange = (variantId: string) => {
    const variant = product.product_variants?.find((v: any) => v.id === variantId);
    if (variant) {
      onVariantChange(product.id, variantId, variant.size, parseFloat(variant.price));
      
      // Update active image to show variant-specific image if available
      if (product.product_images?.length > 0) {
        const variantImageIndex = product.product_images.findIndex((img: any) => 
          img.variant_id === variantId
        );
        if (variantImageIndex !== -1) {
          setActiveImageIndex(variantImageIndex);
        } else {
          // If no variant-specific image, try to show primary image
          const primaryImageIndex = product.product_images.findIndex((img: any) => img.is_primary);
          if (primaryImageIndex !== -1) {
            setActiveImageIndex(primaryImageIndex);
          }
        }
      }
    }
  };

  // Update images when variant changes or component mounts
  useEffect(() => {
    if (product.product_images?.length > 0) {
      const selectedVariant = selectedVariants[product.id];
      if (selectedVariant) {
        const variantImageIndex = product.product_images.findIndex((img: any) => 
          img.variant_id === selectedVariant.variantId
        );
        if (variantImageIndex !== -1) {
          setActiveImageIndex(variantImageIndex);
          return;
        }
      }
      
      // Default to primary image if no variant-specific image
      const primaryImageIndex = product.product_images.findIndex((img: any) => img.is_primary);
      if (primaryImageIndex !== -1) {
        setActiveImageIndex(primaryImageIndex);
      }
    }
  }, [product, selectedVariants]);

  // Get safety icons for display
  const safetyIcons = product.safety_icons || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-auto h-[90vh] flex flex-col p-0 bg-background">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-lg leading-tight pr-8">
              {productName}
            </DialogTitle>
            <Badge variant="secondary" className="w-fit">
              {product.product_code}
            </Badge>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4">
            {/* Product Image Gallery */}
            <Card className="mb-4 overflow-hidden">
              <div className="relative">
                <img
                  src={productImages[activeImageIndex]}
                  alt={productName}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/70"
                  onClick={() => setShowImageZoom(true)}
                >
                  <Eye className="h-4 w-4 text-white" />
                </Button>
                
                {productImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {productImages.length > 1 && (
                <div className="p-2 flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className={`w-12 h-12 object-cover rounded cursor-pointer flex-shrink-0 ${
                        index === activeImageIndex ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Product Info */}
            <div className="space-y-4 mb-4">
              {/* Price and Variant Selection */}
              {product.product_variants && product.product_variants.length > 0 && (
                <Card className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{t('mobile.products.size')}:</Label>
                      <div className="text-lg font-bold text-primary">
                        ₪{(selectedVariant?.price || parseFloat(product.product_variants?.[0]?.price || '0')).toLocaleString()}
                      </div>
                    </div>
                    
                    <Select 
                      value={selectedVariant?.variantId || ''} 
                      onValueChange={handleVariantChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('mobile.products.choose_size')} />
                      </SelectTrigger>
                      <SelectContent>
                        {product.product_variants.map((variant: any) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.size} - ₪{parseFloat(variant.price).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              )}

              {/* Product Description */}
              {productDescription && (
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{t('mobile.products.description')}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {productDescription}
                  </p>
                </Card>
              )}

              {/* Safety Icons */}
              {safetyIcons.length > 0 && (
                <Card className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{t('mobile.products.safety_info')}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {safetyIcons.map((icon: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {icon}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Product Features */}
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{t('mobile.products.features')}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{t('mobile.products.premium_quality')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span>{t('mobile.products.professional_grade')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-3 w-3 text-green-500" />
                    <span>{t('mobile.products.ready_to_use')}</span>
                  </div>
                </div>
              </Card>

              {/* Category Info */}
              {product.product_categories?.[0]?.categories && (
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('mobile.products.category')}:</span>
                    <Badge variant="outline">
                      {product.product_categories[0].categories.name}
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 whitespace-nowrap"
                onClick={onClose}
              >
                {t('common.close')}
              </Button>
              <Button
                onClick={addToCart}
                className="flex-1 h-10 whitespace-nowrap"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {t('mobile.products.add_to_cart')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={showImageZoom} onOpenChange={setShowImageZoom}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{productName}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <img
              src={productImages[activeImageIndex]}
              alt={productName}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};