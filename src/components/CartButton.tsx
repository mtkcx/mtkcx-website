import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const CartButton: React.FC = () => {
  const { setIsOpen, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsOpen(true)}
      className="relative"
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
      <span className="sr-only">Shopping cart</span>
    </Button>
  );
};

export default CartButton;