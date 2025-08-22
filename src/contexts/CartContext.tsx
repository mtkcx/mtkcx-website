import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  saveCartToDatabase: () => Promise<void>;
  loadCartFromDatabase: () => Promise<void>;
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

  // Save cart items to database for authenticated users
  const saveCartToDatabase = async () => {
    if (!user || items.length === 0) return;

    try {
      // Clear existing cart items for this user
      await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', user.id);

      // Insert current cart items
      const cartData = items.map(item => ({
        user_id: user.id,
        product_id: item.productId,
        product_name: item.productName,
        price: item.price,
        quantity: item.quantity,
        variant_size: item.variantSize,
        image_url: item.imageUrl,
      }));

      const { error } = await supabase
        .from('user_carts')
        .insert(cartData);

      if (error) {
        console.error('Error saving cart to database:', error);
      }
    } catch (error) {
      console.error('Error saving cart to database:', error);
    }
  };

  // Load cart items from database for authenticated users
  const loadCartFromDatabase = async () => {
    if (!user) return;

    try {
      const { data: cartData, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading cart from database:', error);
        return;
      }

      if (cartData && cartData.length > 0) {
        const cartItems: CartItem[] = cartData.map(item => ({
          id: `${item.product_id}-${item.variant_size}-${Date.now()}`,
          productId: item.product_id,
          productName: item.product_name,
          productCode: '', // Will be populated from product data if needed
          variantId: `${item.product_id}-${item.variant_size}`,
          variantSize: item.variant_size,
          price: Number(item.price),
          quantity: item.quantity,
          imageUrl: item.image_url,
          categoryName: '', // Will be populated from product data if needed
        }));

        setItems(cartItems);
        
        // Also save to localStorage for backup
        const cartKey = getCartKey();
        if (cartKey) {
          localStorage.setItem(cartKey, JSON.stringify(cartItems));
        }
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
    }
  };

  // Get user-specific cart key
  const getCartKey = () => {
    return user ? `shopping-cart-${user.id}` : null;
  };

  // Load cart when user changes or component mounts
  useEffect(() => {
    if (loading) return; // Wait for auth to initialize

    const loadUserCart = async () => {
      if (user) {
        // User is logged in - load from database first
        const { data: cartData, error } = await supabase
          .from('user_carts')
          .select('*')
          .eq('user_id', user.id);

        let databaseItems: CartItem[] = [];
        if (!error && cartData && cartData.length > 0) {
          databaseItems = cartData.map(item => ({
            id: `${item.product_id}-${item.variant_size}-${Date.now()}`,
            productId: item.product_id,
            productName: item.product_name,
            productCode: '',
            variantId: `${item.product_id}-${item.variant_size}`,
            variantSize: item.variant_size,
            price: Number(item.price),
            quantity: item.quantity,
            imageUrl: item.image_url,
            categoryName: '',
          }));
        }

        // Check localStorage for any additional items
        const cartKey = getCartKey();
        let localItems: CartItem[] = [];
        if (cartKey) {
          const savedCart = localStorage.getItem(cartKey);
          if (savedCart) {
            try {
              localItems = JSON.parse(savedCart);
            } catch (error) {
              console.error('Error loading cart from localStorage:', error);
            }
          }
        }

        // Use database items if they exist, otherwise use localStorage items
        const finalItems = databaseItems.length > 0 ? databaseItems : localItems;
        setItems(finalItems);

        // Save final items to localStorage
        if (cartKey && finalItems.length > 0) {
          localStorage.setItem(cartKey, JSON.stringify(finalItems));
          // Save to database if we used localStorage items (sync up)
          if (finalItems === localItems && databaseItems.length === 0) {
            setTimeout(() => saveCartToDatabase(), 100);
          }
        }
      } else {
        // User is logged out - clear local state only (database cart persists)
        setItems([]);
        // Clear localStorage for guest cart only
        localStorage.removeItem('shopping-cart');
      }
    };

    loadUserCart();
  }, [user, loading]);

  // Save cart to localStorage and database whenever items change
  useEffect(() => {
    if (loading || !user || items.length === 0) return;
    
    const cartKey = getCartKey();
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
      // Debounce database saves to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveCartToDatabase();
      }, 500);
      
      return () => clearTimeout(timeoutId);
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

    // Clear from database if user is logged in
    if (user) {
      supabase
        .from('user_carts')
        .delete()
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error clearing cart from database:', error);
          }
        });
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
        saveCartToDatabase,
        loadCartFromDatabase,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};