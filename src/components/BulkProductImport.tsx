import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ParsedProduct {
  name: string;
  variants: {
    size: string;
    price: number;
    sku: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BulkProductImportProps {
  categories: Category[];
  onImportComplete: () => void;
}

export const BulkProductImport: React.FC<BulkProductImportProps> = ({
  categories,
  onImportComplete,
}) => {
  const [productData, setProductData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const parseProductData = (data: string): ParsedProduct[] => {
    const lines = data.trim().split('\n');
    const productMap = new Map<string, ParsedProduct>();

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Split by the last tab or multiple spaces to separate name and price
      const lastSpaceIndex = trimmedLine.lastIndexOf('\t') !== -1 ? 
        trimmedLine.lastIndexOf('\t') : 
        trimmedLine.lastIndexOf('  ');
      
      if (lastSpaceIndex === -1) return;

      const fullName = trimmedLine.substring(0, lastSpaceIndex).trim();
      const priceStr = trimmedLine.substring(lastSpaceIndex + 1).trim();
      const price = parseFloat(priceStr);

      if (isNaN(price)) return;

      // Extract base name and size
      const sizeRegex = /\s+(\d+(?:\.\d+)?(?:ml|L|cm|mm|inch|Inch)\b|\d+X\d+(?:X\d+)?(?:cm|mm)?|[\d.]+\s*(?:ml|L|cm|mm|inch|Inch)|Short\s+\d+Inch\s*\([^)]+\)|\d+Inch\s*\([^)]+\)|[\d.]+gsm)/i;
      const sizeMatch = fullName.match(sizeRegex);
      
      let baseName = fullName;
      let size = 'Standard';
      
      if (sizeMatch) {
        size = sizeMatch[1] || sizeMatch[0];
        baseName = fullName.replace(sizeMatch[0], '').trim();
      } else {
        // Check for patterns like "250ml", "1L" at the end
        const endSizeRegex = /\s+(\d+(?:\.\d+)?(?:ml|L|cm|mm|inch|Inch))$/i;
        const endSizeMatch = fullName.match(endSizeRegex);
        if (endSizeMatch) {
          size = endSizeMatch[1];
          baseName = fullName.replace(endSizeMatch[0], '').trim();
        }
      }

      // Generate SKU from original name
      const sku = fullName.toUpperCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      if (!productMap.has(baseName)) {
        productMap.set(baseName, {
          name: baseName,
          variants: []
        });
      }

      productMap.get(baseName)!.variants.push({
        size,
        price,
        sku
      });
    });

    return Array.from(productMap.values());
  };

  const handleParse = () => {
    try {
      const parsed = parseProductData(productData);
      setParsedProducts(parsed);
      toast({
        title: "Data Parsed Successfully",
        description: `Found ${parsed.length} unique products with ${parsed.reduce((acc, p) => acc + p.variants.length, 0)} total variants.`,
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse product data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!selectedCategoryId) {
      toast({
        title: "Category Required",
        description: "Please select a category for the products.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    try {
      for (let i = 0; i < parsedProducts.length; i++) {
        const product = parsedProducts[i];
        
        // Create product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: `${product.name} - Auto-imported product`,
            category_id: selectedCategoryId,
            product_code: product.name.toUpperCase().replace(/\s+/g, '-'),
            status: 'active',
            featured: false,
          })
          .select()
          .single();

        if (productError) {
          console.error('Error creating product:', productError);
          continue;
        }

        // Create variants
        const variantsToInsert = product.variants.map(variant => ({
          product_id: productData.id,
          size: variant.size,
          price: variant.price,
          sku: variant.sku,
          stock_quantity: 0, // Default stock
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantsError) {
          console.error('Error creating variants:', variantsError);
        }

        setProgress(((i + 1) / parsedProducts.length) * 100);
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${parsedProducts.length} products.`,
      });

      onImportComplete();
      setParsedProducts([]);
      setProductData('');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "An error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Product Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Product Data (Name[tab/spaces]Price format)</label>
          <Textarea
            value={productData}
            onChange={(e) => setProductData(e.target.value)}
            placeholder="Paste your product data here..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleParse} disabled={!productData.trim()}>
            Parse Data
          </Button>
          
          {parsedProducts.length > 0 && (
            <>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !selectedCategoryId}
              >
                {isImporting ? 'Importing...' : `Import ${parsedProducts.length} Products`}
              </Button>
            </>
          )}
        </div>

        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Importing products... {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {parsedProducts.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Preview ({parsedProducts.length} products):</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {parsedProducts.slice(0, 10).map((product, index) => (
                <div key={index} className="p-2 border rounded text-sm">
                  <div className="font-medium">{product.name}</div>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {product.variants.map((variant, vIndex) => (
                      <Badge key={vIndex} variant="outline" className="text-xs">
                        {variant.size}: ₪{variant.price}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              {parsedProducts.length > 10 && (
                <div className="text-sm text-muted-foreground">
                  ...and {parsedProducts.length - 10} more products
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};