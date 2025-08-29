import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminProduct {
  id: string;
  name: string;
  product_code: string;
  image_url?: string;
  category?: {
    name: string;
  };
}

interface Upsell {
  id: string;
  product_id: string;
  upsell_product_id: string;
  display_order: number;
  upsell_product: AdminProduct;
}

interface ProductForUpsell {
  id?: string;
  name: string;
  product_code?: string;
  status?: string;
}

interface ProductUpsellManagerProps {
  products: ProductForUpsell[];
  onUpdate: () => void;
}

export const ProductUpsellManager: React.FC<ProductUpsellManagerProps> = ({
  products,
  onUpdate,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [availableProducts, setAvailableProducts] = useState<AdminProduct[]>([]);
  const [selectedUpsellId, setSelectedUpsellId] = useState<string>('');
  const [existingUpsells, setExistingUpsells] = useState<Upsell[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter products for search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load existing upsells when product is selected
  useEffect(() => {
    if (selectedProductId) {
      loadUpsells();
      setAvailableProducts(products.filter((p): p is AdminProduct => 
        Boolean(p.id) && p.id !== selectedProductId
      ).map(p => ({
        id: p.id!,
        name: p.name,
        product_code: p.product_code || '',
        image_url: undefined,
        category: undefined
      })));
    }
  }, [selectedProductId, products]);

  const loadUpsells = async () => {
    if (!selectedProductId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_upsells')
        .select(`
          *,
          upsell_product:products!product_upsells_upsell_product_id_fkey (
            id,
            name,
            product_code,
            image_url
          )
        `)
        .eq('product_id', selectedProductId)
        .order('display_order');

      if (error) throw error;

      setExistingUpsells(data || []);
    } catch (error) {
      console.error('Error loading upsells:', error);
      toast({
        title: "Error",
        description: "Failed to load upsells",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpsell = async () => {
    if (!selectedProductId || !selectedUpsellId) {
      toast({
        title: "Error",
        description: "Please select both a product and an upsell product",
        variant: "destructive",
      });
      return;
    }

    try {
      const nextDisplayOrder = existingUpsells.length > 0
        ? Math.max(...existingUpsells.map(u => u.display_order)) + 1
        : 1;

      const { error } = await supabase
        .from('product_upsells')
        .insert({
          product_id: selectedProductId,
          upsell_product_id: selectedUpsellId,
          display_order: nextDisplayOrder,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Upsell added successfully",
      });

      setSelectedUpsellId('');
      setIsAddDialogOpen(false);
      loadUpsells();
      onUpdate();
    } catch (error) {
      console.error('Error adding upsell:', error);
      toast({
        title: "Error",
        description: "Failed to add upsell",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUpsell = async (upsellId: string) => {
    if (!confirm('Are you sure you want to remove this upsell?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product_upsells')
        .delete()
        .eq('id', upsellId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Upsell removed successfully",
      });

      loadUpsells();
      onUpdate();
    } catch (error) {
      console.error('Error deleting upsell:', error);
      toast({
        title: "Error",
        description: "Failed to remove upsell",
        variant: "destructive",
      });
    }
  };

  const handleReorderUpsell = async (upsellId: string, direction: 'up' | 'down') => {
    const upsell = existingUpsells.find(u => u.id === upsellId);
    if (!upsell) return;

    const currentOrder = upsell.display_order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find upsell to swap with
    const targetUpsell = existingUpsells.find(u => u.display_order === newOrder);

    try {
      if (targetUpsell) {
        // Swap display orders
        await supabase
          .from('product_upsells')
          .update({ display_order: currentOrder })
          .eq('id', targetUpsell.id);
      }

      await supabase
        .from('product_upsells')
        .update({ display_order: newOrder })
        .eq('id', upsellId);

      toast({
        title: "Success",
        description: "Upsell order updated successfully",
      });

      loadUpsells();
    } catch (error) {
      console.error('Error reordering upsell:', error);
      toast({
        title: "Error",
        description: "Failed to update upsell order",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Upsells Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Selection */}
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or product code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="product-select">Select Product to Manage Upsells</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.filter(p => p.id).map((product) => (
                  <SelectItem key={product.id} value={product.id!}>
                    {product.name} ({product.product_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Existing Upsells */}
        {selectedProductId && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Current Upsells</h3>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Upsell
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Product Upsell</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upsell-select">Select Upsell Product</Label>
                      <Select value={selectedUpsellId} onValueChange={setSelectedUpsellId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product to upsell..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts
                            .filter(p => !existingUpsells.some(u => u.upsell_product_id === p.id))
                            .map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.product_code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUpsell} disabled={!selectedUpsellId}>
                        Add Upsell
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading upsells...</div>
            ) : existingUpsells.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upsells configured for this product. Add some above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Upsell Product</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingUpsells.map((upsell) => (
                    <TableRow key={upsell.id}>
                      <TableCell>{upsell.display_order}</TableCell>
                      <TableCell className="font-medium">
                        {upsell.upsell_product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {upsell.upsell_product.product_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorderUpsell(upsell.id, 'up')}
                            disabled={upsell.display_order === 1}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorderUpsell(upsell.id, 'down')}
                            disabled={upsell.display_order === Math.max(...existingUpsells.map(u => u.display_order))}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUpsell(upsell.id)}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
