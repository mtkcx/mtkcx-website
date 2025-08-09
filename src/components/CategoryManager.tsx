import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order?: number;
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesUpdate: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCategoriesUpdate,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = generateSlug(newCategoryName);
      const nextDisplayOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.display_order || 0)) + 1 
        : 1;

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategoryName.trim(),
          slug,
          display_order: nextDisplayOrder,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category added successfully",
      });

      setNewCategoryName('');
      setIsAddDialogOpen(false);
      onCategoriesUpdate();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      onCategoriesUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleReorderCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const currentOrder = category.display_order || 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find category to swap with
    const targetCategory = categories.find(c => (c.display_order || 0) === newOrder);
    
    try {
      if (targetCategory) {
        // Swap display orders
        await supabase
          .from('categories')
          .update({ display_order: currentOrder })
          .eq('id', targetCategory.id);
      }

      await supabase
        .from('categories')
        .update({ display_order: newOrder })
        .eq('id', categoryId);

      toast({
        title: "Success",
        description: "Category order updated successfully",
      });

      onCategoriesUpdate();
    } catch (error) {
      console.error('Error reordering category:', error);
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Category Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCategory();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCategory}
                    disabled={isSubmitting || !newCategoryName.trim()}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Category'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Display Order</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.slug}</Badge>
                </TableCell>
                <TableCell>{category.display_order || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderCategory(category.id, 'up')}
                      disabled={category.display_order === 1}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderCategory(category.id, 'down')}
                      disabled={category.display_order === Math.max(...categories.map(c => c.display_order || 0))}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found. Add your first category above.
          </div>
        )}
      </CardContent>
    </Card>
  );
};