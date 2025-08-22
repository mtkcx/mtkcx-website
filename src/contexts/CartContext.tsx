import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  variantId: string;
  variantSize: string;
  price: number;
  quantity: number;
  imageUrl: string;
  categoryName: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  // Get user-specific cart key
  const getCartKey = () => {
    return user ? `shopping-cart-${user.id}` : null;
  };

  // Load cart from localStorage when user changes or component mounts
  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const cartKey = getCartKey();
    
    if (user && cartKey) {
      // User is logged in - load their specific cart
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } else {
      // User is logged out - clear cart completely
      setItems([]);
      // Also clear any existing cart data
      localStorage.removeItem('shopping-cart'); // Remove old non-user-specific cart
    }
  }, [user, loading]);

  // Save cart to localStorage whenever items change (only if user is logged in)
  useEffect(() => {
    if (loading) return;
    
    const cartKey = getCartKey();
    if (user && cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, user, loading]);

  const addToCart = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    // Only allow adding to cart if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }

    setItems(prevItems => {
      // Check if item with same product and variant already exists
      const existingItem = prevItems.find(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      );

      if (existingItem) {
        // Update quantity of existing item
        return prevItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        const cartItem: CartItem = {
          ...newItem,
          id: `${newItem.productId}-${newItem.variantId}-${Date.now()}`,
          quantity: 1,
        };
        return [...prevItems, cartItem];
      }
    });

    toast({
      title: "Added to Cart",
      description: `${newItem.productName} (${newItem.variantSize}) has been added to your cart.`,
    });

    // Open cart drawer
    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    
    // Clear from localStorage if user is logged in
    const cartKey = getCartKey();
    if (cartKey) {
      localStorage.removeItem(cartKey);
    }
    
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};