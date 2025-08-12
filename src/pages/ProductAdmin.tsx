import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { ProductUpsellManager } from '@/components/ProductUpsellManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

interface Product {
  id?: string;
  name: string;
  description: string;
  name_ar?: string;
  name_he?: string;
  description_ar?: string;
  description_he?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('products');

  const itemsPerPage = 10;

  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    name_ar: '',
    name_he: '',
    description_ar: '',
    description_he: '',
    category: '',
    product_code: '',
    status: 'active',
    featured: false,
    images: [],
    variants: [],
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data: productsWithCategories, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(
            category_id,
            categories(id, name, slug)
          )
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*');

      if (variantsError) console.error('Variants fetch error:', variantsError);

      const formattedProducts: Product[] = productsWithCategories.map(product => {
        const productVariants = variantsData?.filter(variant => variant.product_id === product.id) || [];
        
        const categoryNames = product.product_categories
          ?.map((pc: any) => pc.categories?.name)
          .filter(Boolean)
          .join(', ') || '';
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          name_ar: product.name_ar || '',
          name_he: product.name_he || '',
          description_ar: product.description_ar || '',
          description_he: product.description_he || '',
          category: categoryNames,
          product_code: product.product_code || '',
          status: (product.status as 'active' | 'inactive') || 'active',
          featured: product.featured || false,
          images: [],
          variants: productVariants.map((variant: any) => ({
            id: variant.id,
            size: variant.size,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            sku: variant.sku,
            is_primary: variant.is_primary || false,
          })),
        };
      });

      setProducts(formattedProducts);
      
    } catch (error) {
      console.error('Fetch products error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
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

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.product_code) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        name_ar: formData.name_ar || null,
        name_he: formData.name_he || null,
        description_ar: formData.description_ar || null,
        description_he: formData.description_he || null,
        product_code: formData.product_code,
        status: formData.status,
        featured: formData.featured,
      };

      let productId: string;

      if (editingProduct?.id) {
        const { error: productError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (productError) throw productError;
        productId = editingProduct.id;

        await supabase.from('product_variants').delete().eq('product_id', productId);
      } else {
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (productError) throw productError;
        productId = newProduct.id;
      }

      if (formData.variants.length > 0) {
        const variantInserts = formData.variants.map(variant => ({
          product_id: productId,
          size: variant.size,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          sku: variant.sku,
          is_primary: variant.is_primary || false,
        }));
        
        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantInserts);

        if (variantsError) throw variantsError;
      }

      await supabase.from('product_images').delete().eq('product_id', productId);
      
      if (formData.images.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(
            formData.images.map((image) => ({
              product_id: productId,
              image_url: image.image_url,
              display_order: image.display_order,
              is_primary: image.is_primary,
              alt_text: image.alt_text,
              variant_id: image.variant_id || null,
            }))
          );

        if (imagesError) throw imagesError;
      }

      toast({
        title: "Success",
        description: editingProduct ? "Product updated successfully" : "Product created successfully",
      });

      // Don't close dialog or reset form to allow quick navigation to next product
      if (!editingProduct) {
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetForm();
      }
      loadProducts();

    } catch (error) {
      console.error('Save product error:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation functions for product editing
  const navigateToProduct = async (direction: 'prev' | 'next') => {
    if (!editingProduct) return;
    
    const currentIndex = filteredProducts.findIndex(p => p.id === editingProduct.id);
    let nextIndex;
    
    if (direction === 'prev') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredProducts.length - 1;
    } else {
      nextIndex = currentIndex < filteredProducts.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextProduct = filteredProducts[nextIndex];
    if (nextProduct) {
      await handleEditProduct(nextProduct);
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');

      if (imagesError) console.error('Error fetching images:', imagesError);

      const productWithImages = {
        ...product,
        images: imagesData || []
      };

      setEditingProduct(productWithImages);
      setFormData(productWithImages);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error preparing product for edit:', error);
      setEditingProduct(product);
      setFormData(product);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

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
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      name_ar: '',
      name_he: '',
      description_ar: '',
      description_he: '',
      category: '',
      product_code: '',
      status: 'active',
      featured: false,
      images: [],
      variants: [],
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Product Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your product catalog, categories, and inventory
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="upsells">Product Upsells</TabsTrigger>
            <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
            <TabsTrigger value="bulk-categories">Bulk Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => {
                resetForm();
                setEditingProduct(null);
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Products ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'No products found matching your criteria.' 
                        : 'No products found. Add your first product to get started.'}
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Variants</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {product.description}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{product.product_code}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {product.variants.length} sizes
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                    {product.status}
                                  </Badge>
                                  {product.featured && (
                                    <Badge variant="outline" className="ml-1">Featured</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id!)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager 
              categories={categories}
              onCategoriesUpdate={loadCategories}
            />
          </TabsContent>

          <TabsContent value="upsells">
            <ProductUpsellManager
              products={products}
              onUpdate={() => {
                loadProducts();
                loadCategories();
              }}
            />
          </TabsContent>

          <TabsContent value="bulk-import">
            <BulkProductImport 
              categories={categories}
              onImportComplete={loadProducts} 
            />
          </TabsContent>

          <TabsContent value="bulk-categories">
            <BulkCategoryManager 
              categories={categories}
              onUpdateComplete={loadProducts}
            />
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex-1">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                {editingProduct && filteredProducts.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToProduct('prev')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {filteredProducts.findIndex(p => p.id === editingProduct.id) + 1} / {filteredProducts.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToProduct('next')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name (English) *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name in English"
                  />
                </div>
                <div>
                  <Label htmlFor="product_code">Product Code *</Label>
                  <Input
                    id="product_code"
                    value={formData.product_code}
                    onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                    placeholder="Enter unique product code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_ar">Product Name (Arabic)</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="اسم المنتج بالعربية"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="name_he">Product Name (Hebrew)</Label>
                  <Input
                    id="name_he"
                    value={formData.name_he}
                    onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                    placeholder="שם המוצר בעברית"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (English) *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed product description in English"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_ar">Description (Arabic)</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    placeholder="وصف المنتج بالعربية"
                    dir="rtl"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="description_he">Description (Hebrew)</Label>
                  <Textarea
                    id="description_he"
                    value={formData.description_he}
                    onChange={(e) => setFormData({ ...formData, description_he: e.target.value })}
                    placeholder="תיאור המוצר בעברית"
                    dir="rtl"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <Label>Product Images</Label>
                <ProductImageManager
                  images={formData.images}
                  variants={formData.variants}
                  onImagesChange={(images) => setFormData({ ...formData, images })}
                />
              </div>

              {/* Product Variants */}
              <div>
                <Label>Product Variants & Pricing</Label>
                <ProductVariantManager
                  variants={formData.variants}
                  onVariantsChange={(variants) => setFormData({ ...formData, variants })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtectedRoute>
  );
}