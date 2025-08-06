import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package } from 'lucide-react';

interface ProductVariant {
  id: string;
  size: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  productId: string;
  productName: string;
  productCode: string;
  imageUrl: string;
  categoryName: string;
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
  productId,
  productName,
  productCode,
  imageUrl,
  categoryName,
}) => {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({
        productId,
        productName,
        productCode,
        variantId: selectedVariant.id,
        variantSize: selectedVariant.size,
        price: selectedVariant.price,
        imageUrl,
        categoryName,
      });
    }
  };

  // Sort variants by size for logical ordering
  const sortedVariants = [...variants].sort((a, b) => {
    const sizeOrder = ['250ml', '500ml', '750ml', '1L', '5L', '10L', '20L'];
    return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Available Sizes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sortedVariants.map((variant) => (
            <Card
              key={variant.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedVariant?.id === variant.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onVariantSelect(variant)}
            >
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <Package className="w-6 h-6 mx-auto text-muted-foreground" />
                  <div className="font-semibold text-lg">{variant.size}</div>
                   {variant.price > 0 ? (
                     <div className="text-primary font-bold text-xl">
                       ₪{variant.price}
                     </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      {t('products.price_tba')}
                    </div>
                  )}
                  <Badge
                    variant={variant.stock_quantity > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {variant.stock_quantity > 0 ? t('products.in_stock') : t('products.out_of_stock')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedVariant && (
        <div className="border-t pt-6">
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Selected:</span>
              <span className="font-semibold">{selectedVariant.size}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">SKU:</span>
              <span className="text-muted-foreground">{selectedVariant.sku}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('products.price_label')}</span>
               <span className="text-xl font-bold text-primary">
                 {selectedVariant.price > 0 ? `₪${selectedVariant.price}` : t('products.price_tba_label')}
               </span>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleAddToCart}
              disabled={selectedVariant.stock_quantity === 0 || selectedVariant.price === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {selectedVariant.price === 0 ? t('products.price_coming_soon') : t('products.add_to_cart')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;