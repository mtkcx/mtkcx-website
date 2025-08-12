import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  onClose
}) => {
  console.log("=== DIALOG COMPONENT CALLED ===");
  console.log("Product:", product);
  console.log("IsOpen:", isOpen);
  
  if (!product) {
    console.log("No product - returning null");
    return null;
  }

  console.log("About to render dialog");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>TEST DIALOG</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <h2 className="text-lg font-bold">Product: {product.name}</h2>
          <p>Product Code: {product.product_code}</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};