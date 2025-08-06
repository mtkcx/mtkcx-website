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
  category_ids: string[]; // Changed to array to support multiple categories
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Changed to array
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
      // Get products with their categories via junction table
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          created_at,
          product_categories(category_id)
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
      
      // Transform data to include category_ids array
      const formattedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        category_ids: Array.isArray(product.product_categories) 
          ? product.product_categories.map((pc: any) => pc.category_id).filter(Boolean)
          : [],
        variants: []
      })) || [];

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
    if (filterCategory === 'uncategorized') matchesCategory = product.category_ids.length === 0;
    else if (filterCategory !== 'all') matchesCategory = product.category_ids.includes(filterCategory);
    
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
    if (selectedProducts.size === 0 || selectedCategories.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select products and at least one target category",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // Add selected products to selected categories
      const productIds = Array.from(selectedProducts);
      const insertData = [];
      
      for (const productId of productIds) {
        for (const categoryId of selectedCategories) {
          insertData.push({
            product_id: productId,
            category_id: categoryId
          });
        }
      }

      // Insert new product-category relationships (ON CONFLICT DO NOTHING to avoid duplicates)
      const { error } = await supabase
        .from('product_categories')
        .upsert(insertData, { onConflict: 'product_id,category_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${selectedProducts.size} products to ${selectedCategories.length} categories`,
      });

      setSelectedProducts(new Set());
      setSelectedCategories([]);
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

  const getCategoryNames = (categoryIds: string[]) => {
    if (categoryIds.length === 0) return 'Uncategorized';
    return categoryIds.map(id => categories.find(c => c.id === id)?.name || 'Unknown').join(', ');
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
              <div className="space-y-2">
                <div className="text-sm font-medium">Add to Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleBulkUpdate} 
                disabled={updating || selectedCategories.length === 0}
              >
                {updating ? 'Adding...' : `Add ${selectedProducts.size} Products to ${selectedCategories.length} Categories`}
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
                  <div className="flex flex-wrap gap-1">
                    {product.category_ids.length === 0 ? (
                      <Badge variant="secondary">Uncategorized</Badge>
                    ) : (
                      product.category_ids.map(categoryId => (
                        <Badge key={categoryId} variant="default">
                          {categories.find(c => c.id === categoryId)?.name || 'Unknown'}
                        </Badge>
                      ))
                    )}
                  </div>
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