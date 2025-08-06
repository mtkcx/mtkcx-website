import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductImageManager, ProductImage } from '@/components/ProductImageManager';
import { ProductVariantManager, ProductVariant } from '@/components/ProductVariantManager';
import { BulkProductImport } from '@/components/BulkProductImport';
import { BulkCategoryManager } from '@/components/BulkCategoryManager';
import { CategoryManager } from '@/components/CategoryManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id?: string;
  name: string;
  description: string;
  category: string;
  product_code: string;
  status: 'active' | 'inactive';
  featured: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductAdmin() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    description: '',
    category: '',
    product_code: '',
    status: 'active',
    featured: false,
    images: [],
    variants: [],
  });

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setCheckingAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchProducts = async () => {
    console.log('🔍 Starting fetchProducts...');
    try {
      setLoading(true);
      
      // Fetch products with their categories via junction table
      console.log('📝 Fetching products with categories...');
      const { data: productsWithCategories, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(
            category_id,
            categories(id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('❌ Products fetch error:', productsError);
        throw productsError;
      }
      console.log('✅ Products fetched:', productsWithCategories?.length || 0);

      // Fetch variants separately
      console.log('📝 Fetching variants...');
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*');

      if (variantsError) {
        console.error('❌ Variants fetch error:', variantsError);
        // Don't throw - variants are optional for now
      }
      console.log('✅ Variants fetched:', variantsData?.length || 0);

      // Format the products
      console.log('🔄 Formatting products...');
      const formattedProducts: Product[] = productsWithCategories.map(product => {
        const productVariants = variantsData?.filter(variant => variant.product_id === product.id) || [];
        
        // Get category names from the junction table
        const categoryNames = product.product_categories
          ?.map((pc: any) => pc.categories?.name)
          .filter(Boolean)
          .join(', ') || '';
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          category: categoryNames,
          product_code: product.product_code || '',
          status: (product.status as 'active' | 'inactive') || 'active',
          featured: product.featured || false,
          images: [], // Will be populated when needed
          variants: productVariants.map((variant: any) => ({
            id: variant.id,
            size: variant.size,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            sku: variant.sku,
          })),
        };
      });

      console.log('✅ Products formatted successfully:', formattedProducts.length);
      setProducts(formattedProducts);
      
    } catch (error) {
      console.error('💥 Fetch products error:', error);
      toast({
        title: "Error",
        description: `Failed to fetch products: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 fetchProducts completed');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const saveProduct = async (product: Product) => {
    try {
      if (product.id) {
        // Update existing product
        const { error: productError } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            category: product.category || null,
            product_code: product.product_code,
            status: product.status,
            featured: product.featured,
          })
          .eq('id', product.id);

        if (productError) throw productError;

        // Update variants and get their IDs
        await supabase.from('product_variants').delete().eq('product_id', product.id);
        
        let variantIdMap = new Map();
        if (product.variants.length > 0) {
          console.log('Updating variants:', product.variants);
          const variantInserts = product.variants.map(variant => ({
            product_id: product.id,
            size: variant.size,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            sku: variant.sku,
          }));
          console.log('Variant inserts:', variantInserts);
          
          const { data: variantsData, error: variantsError } = await supabase
            .from('product_variants')
            .insert(variantInserts)
            .select();

          if (variantsError) {
            console.error('Variants error:', variantsError);
            throw variantsError;
          }
          
          // Map old variant IDs to new ones for existing products
          variantsData?.forEach((newVariant, index) => {
            const oldVariant = product.variants[index];
            if (oldVariant.id) {
              variantIdMap.set(oldVariant.id, newVariant.id);
            }
          });
        }

        // Update images with correct variant IDs
        await supabase.from('product_images').delete().eq('product_id', product.id);
        
        if (product.images.length > 0) {
          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(
              product.images.map((image) => ({
                product_id: product.id,
                image_url: image.image_url,
                display_order: image.display_order,
                is_primary: image.is_primary,
                alt_text: image.alt_text,
                variant_id: image.variant_id ? variantIdMap.get(image.variant_id) || null : null,
              }))
            );

          if (imagesError) throw imagesError;
        }

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description,
            category: product.category || null,
            product_code: product.product_code,
            status: product.status,
            featured: product.featured,
          })
          .select()
          .single();

        if (productError) throw productError;

        const productId = productData.id;

        // Add variants and get their IDs
        let variantIdMap = new Map();
        if (product.variants.length > 0) {
          console.log('Creating variants:', product.variants);
          const variantInserts = product.variants.map(variant => ({
            product_id: productId,
            size: variant.size,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            sku: variant.sku,
          }));
          console.log('Variant inserts:', variantInserts);
          
          const { data: variantsData, error: variantsError } = await supabase
            .from('product_variants')
            .insert(variantInserts)
            .select();

          if (variantsError) {
            console.error('Variants error:', variantsError);
            throw variantsError;
          }
          
          // Map old variant IDs to new ones
          variantsData?.forEach((newVariant, index) => {
            const oldVariant = product.variants[index];
            if (oldVariant.id) {
              variantIdMap.set(oldVariant.id, newVariant.id);
            }
          });
        }

        // Add images with correct variant IDs
        if (product.images.length > 0) {
          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(
              product.images.map((image) => ({
                product_id: productId,
                image_url: image.image_url,
                display_order: image.display_order,
                is_primary: image.is_primary,
                alt_text: image.alt_text,
                variant_id: image.variant_id ? variantIdMap.get(image.variant_id) || null : null,
              }))
            );

          if (imagesError) throw imagesError;
        }

        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      fetchProducts();
      setIsAddDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      category: '',
      product_code: '',
      status: 'active',
      featured: false,
      images: [],
      variants: [],
    });
  };

  const handleEdit = async (product: Product) => {
    try {
      // Fetch product images when editing
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        toast({
          title: "Warning",
          description: "Could not load product images",
          variant: "destructive",
        });
      }

      const productWithImages = {
        ...product,
        images: imagesData || []
      };

      setEditingProduct(productWithImages);
    } catch (error) {
      console.error('Error preparing product for edit:', error);
      // Still allow editing even if images don't load
      setEditingProduct(product);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <p>Please log in to access the product admin panel.</p>
        </Card>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <p>Checking permissions...</p>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You don't have permission to access the product admin panel.</p>
          <p className="text-sm text-muted-foreground mt-2">Only administrators can manage products.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Administration</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={newProduct}
              categories={categories}
              onSave={saveProduct}
              onChange={setNewProduct}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
          <TabsTrigger value="category-manager">Bulk Category Manager</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No products found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images[0] && (
                              <img
                                src={product.images[0].image_url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.product_code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category || 'Uncategorized'}
                        </TableCell>
                        <TableCell>{product.variants.length} variant(s)</TableCell>
                        <TableCell>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                          {product.featured && (
                            <Badge variant="outline" className="ml-2">Featured</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Product</DialogTitle>
                                </DialogHeader>
                                {editingProduct && (
                                  <ProductForm
                                    product={editingProduct}
                                    categories={categories}
                                    onSave={saveProduct}
                                    onChange={setEditingProduct}
                                  />
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => product.id && deleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-import">
          <BulkProductImport
            categories={categories}
            onImportComplete={fetchProducts}
          />
        </TabsContent>

        <TabsContent value="category-manager">
          <BulkCategoryManager
            categories={categories}
            onUpdateComplete={fetchProducts}
          />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManager
            categories={categories}
            onCategoriesUpdate={fetchCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ProductFormProps {
  product: Product;
  categories: Category[];
  onSave: (product: Product) => void;
  onChange: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSave, onChange }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            required
            value={product.name}
            onChange={(e) => onChange({ ...product, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="product_code">Product Code</Label>
          <Input
            id="product_code"
            value={product.product_code}
            onChange={(e) => onChange({ ...product, product_code: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          value={product.description}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={product.category} onValueChange={(value) => onChange({ ...product, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={product.status} onValueChange={(value: 'active' | 'inactive') => onChange({ ...product, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={product.featured}
              onChange={(e) => onChange({ ...product, featured: e.target.checked })}
            />
            <span>Featured Product</span>
          </label>
        </div>
      </div>

      <ProductImageManager
        images={product.images}
        variants={product.variants}
        onImagesChange={(images) => onChange({ ...product, images })}
      />

      <ProductVariantManager
        variants={product.variants}
        onVariantsChange={(variants) => onChange({ ...product, variants })}
      />

      <Button type="submit" className="w-full">
        {product.id ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
};