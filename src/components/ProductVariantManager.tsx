import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export interface ProductVariant {
  id?: string;
  size: string;
  price: number;
  stock_quantity: number;
  sku: string;
  is_primary?: boolean;
}

interface ProductVariantManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  variants,
  onVariantsChange,
}) => {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      size: '',
      price: 0,
      stock_quantity: 0,
      sku: '',
      is_primary: variants.length === 0, // First variant is primary by default
    };
    onVariantsChange([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
  };

  const isDuplicateSize = (size: string, currentIndex: number) => {
    return variants.some((variant, index) => 
      index !== currentIndex && variant.size.toLowerCase() === size.toLowerCase()
    );
  };

  const setPrimaryVariant = (index: number) => {
    const newVariants = variants.map((variant, i) => ({
      ...variant,
      is_primary: i === index
    }));
    onVariantsChange(newVariants);
  };

  const generateSKU = (index: number) => {
    const variant = variants[index];
    if (variant.size) {
      const sku = `${variant.size.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`;
      updateVariant(index, 'sku', sku);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Product Variants</Label>
        <Button onClick={addVariant} size="sm" type="button">
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          <p>No variants added yet. Click "Add Variant" to create your first size option.</p>
        </Card>
      )}

      {variants.map((variant, index) => (
        <Card key={index} className={`p-4 ${variant.is_primary ? 'border-primary bg-primary/5' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Variant {index + 1}</h4>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={variant.is_primary ? "default" : "outline"}
                size="sm"
                onClick={() => setPrimaryVariant(index)}
              >
                {variant.is_primary ? "Primary" : "Set Primary"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeVariant(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor={`size-${index}`}>Size</Label>
              <Input
                id={`size-${index}`}
                value={variant.size}
                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                placeholder="e.g., S, M, L, XL"
                className={isDuplicateSize(variant.size, index) ? "border-red-500" : ""}
              />
              {isDuplicateSize(variant.size, index) && (
                <p className="text-red-500 text-sm mt-1">This size already exists</p>
              )}
            </div>

            <div>
              <Label htmlFor={`price-${index}`}>Price (₪)</Label>
              <Input
                id={`price-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor={`stock-${index}`}>Stock</Label>
              <Input
                id={`stock-${index}`}
                type="number"
                min="0"
                value={variant.stock_quantity}
                onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor={`sku-${index}`}>SKU</Label>
              <div className="flex gap-2">
                <Input
                  id={`sku-${index}`}
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  placeholder="Auto-generate or enter manually"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateSKU(index)}
                  disabled={!variant.size}
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};