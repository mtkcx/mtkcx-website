import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpsellProduct {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  product_code: string;
  image_url: string;
  category: {
    name: string;
    name_ar?: string;
    name_he?: string;
  };
  variants: {
    id: string;
    size: string;
    price: number;
    stock_quantity: number;
  }[];
}

interface ProductUpsellsProps {
  productId: string;
  currentProductName: string;
}

export const ProductUpsells: React.FC<ProductUpsellsProps> = ({
  productId,
  currentProductName,
}) => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpsells = async () => {
      try {
        setLoading(true);
        
        const { data: upsellData, error } = await supabase
          .from('product_upsells')
          .select(`
            upsell_product_id,
            display_order,
            products!product_upsells_upsell_product_id_fkey (
              id,
              name,
              name_ar,
              name_he,
              product_code,
              status,
              product_categories (
                categories (
                  name,
                  name_ar,
                  name_he
                )
              ),
              product_variants!fk_product_variants_product_id (
                id,
                size,
                price,
                stock_quantity
              ),
              product_images!product_images_product_id_fkey (
                image_url,
                is_primary
              )
            )
          `)
          .eq('product_id', productId)
          .eq('products.status', 'active')
          .order('display_order');

        if (error) throw error;

        const transformedUpsells: UpsellProduct[] = (upsellData || [])
          .filter(item => item.products)
          .map(item => {
            const primaryImage = item.products.product_images?.find(img => img.is_primary);
            return {
              id: item.products.id,
              name: item.products.name,
              name_ar: item.products.name_ar,
              name_he: item.products.name_he,
              product_code: item.products.product_code,
              image_url: primaryImage?.image_url || '/placeholder.svg',
              category: {
                name: item.products.product_categories?.[0]?.categories?.name || 'Uncategorized',
                name_ar: item.products.product_categories?.[0]?.categories?.name_ar,
                name_he: item.products.product_categories?.[0]?.categories?.name_he,
              },
              variants: item.products.product_variants || []
            };
          });

        setUpsellProducts(transformedUpsells);
      } catch (error) {
        console.error('Error fetching upsells:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpsells();
  }, [productId]);

  const handleProductClick = (upsellProductId: string) => {
    navigate(`/products/${upsellProductId}`);
    window.scrollTo(0, 0);
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl || imageUrl === '/placeholder.svg') {
      return '/placeholder.svg';
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a storage path, generate the public URL
    if (imageUrl.startsWith('product-images/')) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(imageUrl.replace('product-images/', ''));
      return data.publicUrl;
    }
    
    return imageUrl;
  };

  const handleQuickAdd = (product: UpsellProduct, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (product.variants.length === 0) {
      toast({
        title: t('products.out_of_stock'),
        description: t('products.no_variants_available'),
        variant: "destructive",
      });
      return;
    }

    const defaultVariant = product.variants[0];
    
    toast({
      title: t('products.added_to_cart'),
      description: t('products.added_to_cart_desc')
        .replace('{productName}', currentLanguage === 'ar' ? (product.name_ar || product.name) :
                                  currentLanguage === 'he' ? (product.name_he || product.name) :
                                  product.name)
        .replace('{size}', defaultVariant.size),
    });
  };

  if (loading || upsellProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">
            {t('products.frequently_bought_together')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('products.complete_your_kit_description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {upsellProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-background"
              onClick={() => handleProductClick(product.id)}
            >
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted/50">
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={currentLanguage === 'ar' ? (product.name_ar || product.name) :
                           currentLanguage === 'he' ? (product.name_he || product.name) :
                           product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.product_code}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                      {currentLanguage === 'ar' ? (product.name_ar || product.name) :
                       currentLanguage === 'he' ? (product.name_he || product.name) :
                       product.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {currentLanguage === 'ar' ? (product.category.name_ar || product.category.name) :
                       currentLanguage === 'he' ? (product.category.name_he || product.category.name) :
                       product.category.name}
                    </Badge>
                  </div>

                  {product.variants.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        ₪{product.variants[0].price}
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="h-8 px-3"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {t('products.quick_add')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t('products.professional_recommendation_notice')}
          </p>
        </div>
      </div>
    </section>
  );
};