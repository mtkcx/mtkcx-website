import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order?: number;
}

interface SortableCategoryRowProps {
  category: Category;
  onDelete: (categoryId: string) => void;
}

export const SortableCategoryRow: React.FC<SortableCategoryRowProps> = ({
  category,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'z-50' : ''}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing p-1 h-auto"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          <span className="font-medium">{category.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{category.slug}</Badge>
      </TableCell>
      <TableCell>{category.display_order || 0}</TableCell>
      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(category.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};