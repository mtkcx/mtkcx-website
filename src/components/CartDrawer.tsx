import React from 'react';
import { useCart } from '@/contexts/CartContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

const CartDrawer: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    isOpen,
    setIsOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    setIsOpen(false);
    
    // Check if we're on mobile route
    if (location.pathname === '/mobile') {
      // Trigger mobile checkout via custom event
      window.dispatchEvent(new CustomEvent('mobile-checkout-open'));
    } else {
      // Navigate to regular checkout page
      navigate('/checkout');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('cart.title')}
            {getTotalItems() > 0 && (
              <Badge variant="secondary">{getTotalItems()} {t('cart.items')}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {t('cart.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full max-h-[80vh]">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">{t('cart.empty')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('cart.empty_description')}
                </p>
                <Button onClick={() => setIsOpen(false)}>
                  {t('cart.continue_shopping')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 my-4 max-h-[50vh]">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{item.productName}</h4>
                           <p className="text-xs text-muted-foreground">
                             {t('cart.size')}: {item.variantSize}
                           </p>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs py-0 px-1">
                              {item.productCode}
                            </Badge>
                            <Badge variant="secondary" className="text-xs py-0 px-1">
                              {item.categoryName}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-3 pt-3 border-t mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('cart.total')} ({getTotalItems()} {t('cart.items')})
                  </span>
                  <span className="font-bold text-base">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                    size="sm"
                  >
                    {t('cart.clear_cart')}
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1"
                    size="sm"
                  >
                    {t('cart.checkout')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;