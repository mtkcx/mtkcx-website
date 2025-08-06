import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
  const [showRecentOnly, setShowRecentOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [showRecentOnly]);

  const fetchProducts = async () => {
    console.log('🔍 BulkCategoryManager: Starting fetchProducts...');
    try {
      // Get products with creation date for filtering
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          category_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      // If showing recent only, filter to last 24 hours
      if (showRecentOnly) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte('created_at', yesterday.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ BulkCategoryManager: Products fetch error:', error);
        throw error;
      }

      console.log('✅ BulkCategoryManager: Products fetched:', data?.length || 0);
      
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        category_id: product.category_id || '',
        variants: [] // We don't need variants for category management
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('💥 BulkCategoryManager: Fetch products error:', error);
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
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    let matchesCategory = true;
    if (filterCategory === 'uncategorized') matchesCategory = !product.category_id;
    else if (filterCategory !== 'all') matchesCategory = product.category_id === filterCategory;
    
    return matchesSearch && matchesCategory;
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
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Button
            variant={showRecentOnly ? "default" : "outline"}
            onClick={() => setShowRecentOnly(!showRecentOnly)}
            size="sm"
          >
            {showRecentOnly ? "Recent Imports (24h)" : "All Products"}
          </Button>
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