import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Shield, Award } from 'lucide-react';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  alt_text: string | null;
  variant_id: string | null;
}

interface Product {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  description: string;
  description_ar?: string;
  description_he?: string;
  product_code: string;
  image_url: string;
  all_images: ProductImage[];
  safety_icons: string[] | null;
  category: {
    id: string;
    name: string;
    name_ar?: string;
    name_he?: string;
    slug: string;
  };
  variants: ProductVariant[];
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            product_categories (
              category_id,
              categories (
                id,
                name,
                name_ar,
                name_he,
                slug
              )
            ),
            product_variants!fk_product_variants_product_id (
              id,
              size,
              price,
              stock_quantity,
              sku
            ),
            product_images (
              id,
              image_url,
              is_primary,
              alt_text,
              display_order,
              variant_id
            )
          `)
          .eq('id', productId)
          .eq('status', 'active')
          .single();

        if (productError) throw productError;

        if (productData) {
          // Process all images
          const allImages = productData.product_images || [];
          const primaryImage = allImages.find(img => img.is_primary) || allImages[0];
          
          const transformedProduct: Product = {
            id: productData.id,
            name: productData.name,
            name_ar: productData.name_ar,
            name_he: productData.name_he,
            description: productData.description,
            description_ar: productData.description_ar,
            description_he: productData.description_he,
            product_code: productData.product_code,
            image_url: primaryImage?.image_url || productData.image_url || '/placeholder.svg',
            all_images: allImages,
            safety_icons: productData.safety_icons,
            category: productData.product_categories && productData.product_categories.length > 0 ? {
              id: productData.product_categories[0].categories.id,
              name: productData.product_categories[0].categories.name,
              name_ar: productData.product_categories[0].categories.name_ar,
              name_he: productData.product_categories[0].categories.name_he,
              slug: productData.product_categories[0].categories.slug,
            } : {
              id: 'uncategorized',
              name: 'Uncategorized',
              name_ar: undefined,
              name_he: undefined,
              slug: 'uncategorized',
            },
            variants: productData.product_variants || []
          };

          setProduct(transformedProduct);
          setCurrentImage(transformedProduct.image_url);
          
          // Auto-select first available variant
          if (transformedProduct.variants.length > 0) {
            setSelectedVariant(transformedProduct.variants[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: t('products.error_title'),
          description: t('products.failed_load_details'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  // Update current image when variant changes
  useEffect(() => {
    if (product && selectedVariant) {
      // Find variant-specific image or use general images
      const variantImage = product.all_images.find(img => img.variant_id === selectedVariant.id);
      const generalImage = product.all_images.find(img => !img.variant_id);
      
      if (variantImage) {
        setCurrentImage(variantImage.image_url);
      } else if (generalImage) {
        setCurrentImage(generalImage.image_url);
      } else if (product.all_images.length > 0) {
        setCurrentImage(product.all_images[0].image_url);
      }
    }
  }, [selectedVariant, product]);

  const handleAddToCart = (variant: ProductVariant) => {
    toast({
      title: t('products.added_to_cart'),
      description: t('products.added_to_cart_desc')
        .replace('{productName}', currentLanguage === 'ar' ? (product?.name_ar || product?.name || '') :
                                  currentLanguage === 'he' ? (product?.name_he || product?.name || '') :
                                  (product?.name || ''))
        .replace('{size}', variant.size),
    });
  };

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => {
      if (line.startsWith('✅')) {
        return (
          <li key={index} className="flex items-start gap-2 text-muted-foreground">
            <span className="text-green-500 mt-0.5">✅</span>
            <span>{line.substring(2).trim()}</span>
          </li>
        );
      }
      return line.trim() && (
        <p key={index} className="text-muted-foreground mb-3">
          {line}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6 w-32" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('products.back_to_products_new')}
          </Button>
          <span className="text-muted-foreground">/</span>
          <Badge variant="outline">
            {currentLanguage === 'ar' ? (product.category.name_ar || product.category.name) :
             currentLanguage === 'he' ? (product.category.name_he || product.category.name) :
             product.category.name}
          </Badge>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">
            {currentLanguage === 'ar' ? (product.name_ar || product.name) :
             currentLanguage === 'he' ? (product.name_he || product.name) :
             product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-primary-foreground">
                  {product.product_code}
                </Badge>
              </div>
            </div>

            {/* Image Thumbnails */}
            {product.all_images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.all_images.slice(0, 4).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImage(image.image_url)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === image.image_url 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Product Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium mb-1">Professional Grade</div>
                <div className="text-xs text-muted-foreground">Industry-standard formulation for professional use</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium mb-1">Multiple Sizes</div>
                <div className="text-xs text-muted-foreground">Available in various quantities to meet your needs</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium mb-1">Quality Assured</div>
                <div className="text-xs text-muted-foreground">Rigorously tested and certified for reliability</div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {currentLanguage === 'ar' ? (product.name_ar || product.name) :
                     currentLanguage === 'he' ? (product.name_he || product.name) :
                     product.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {currentLanguage === 'ar' ? (product.category.name_ar || product.category.name) :
                       currentLanguage === 'he' ? (product.category.name_he || product.category.name) :
                       product.category.name}
                    </Badge>
                    <Badge variant="outline">{t('products.sku_label')} {product.product_code}</Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Product Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('products.product_description')}</h3>
                <div className="space-y-2">
                  {formatDescription(
                    currentLanguage === 'ar' ? (product.description_ar || product.description) :
                    currentLanguage === 'he' ? (product.description_he || product.description) :
                    product.description
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Variant Selection */}
              <ProductVariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantSelect={setSelectedVariant}
                productId={product.id}
                productName={currentLanguage === 'ar' ? (product.name_ar || product.name) :
                            currentLanguage === 'he' ? (product.name_he || product.name) :
                            product.name}
                productCode={product.product_code}
                imageUrl={product.image_url}
                categoryName={currentLanguage === 'ar' ? (product.category.name_ar || product.category.name) :
                             currentLanguage === 'he' ? (product.category.name_he || product.category.name) :
                             product.category.name}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;