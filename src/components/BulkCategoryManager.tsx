import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category_id: string;
  variants: Array<{ size: string; price: number }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BulkCategoryManagerProps {
  categories: Category[];
  onUpdateComplete: () => void;
}

export const BulkCategoryManager: React.FC<BulkCategoryManagerProps> = ({
  categories,
  onUpdateComplete,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category_id,
          product_variants(size, price)
        `)
        .order('name');

      if (error) throw error;

      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        category_id: product.category_id || '',
        variants: product.product_variants || []
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'uncategorized') return !product.category_id;
    return product.category_id === filterCategory;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkUpdate = async () => {
    if (selectedProducts.size === 0 || !selectedCategory) {
      toast({
        title: "Selection Required",
        description: "Please select products and a target category",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ category_id: selectedCategory })
        .in('id', Array.from(selectedProducts));

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedProducts.size} products`,
      });

      setSelectedProducts(new Set());
      setSelectedCategory('');
      fetchProducts();
      onUpdateComplete();
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error",
        description: "Failed to update products",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Category Management</CardTitle>
        <div className="flex gap-4 items-center">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProducts.size > 0 && (
            <>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleBulkUpdate} 
                disabled={updating || !selectedCategory}
              >
                {updating ? 'Updating...' : `Update ${selectedProducts.size} Products`}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredProducts.length} products shown • {selectedProducts.size} selected
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Current Category</TableHead>
              <TableHead>Variants</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.category_id ? 'default' : 'secondary'}>
                    {getCategoryName(product.category_id)}
                  </Badge>
                </TableCell>
                <TableCell>{product.variants.length} variant(s)</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};