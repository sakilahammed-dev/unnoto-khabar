'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, DeliveryZone, OrderSubmission } from '@/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isQuickOrderOpen: boolean;
  checkoutItems: CartItem[];
  openQuickOrder: (itemOrItems?: CartItem | CartItem[]) => void;
  closeQuickOrder: () => void;
  deliveryZone: DeliveryZone;
  setDeliveryZone: (zone: DeliveryZone) => void;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  cartCount: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  navigateToCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  lastOrder: OrderSubmission | null;
  setLastOrder: (order: OrderSubmission | null) => void;
  showCartToast: boolean;
  setShowCartToast: (show: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const FREE_SHIPPING_THRESHOLD = 3000;
export const DELIVERY_RATES: Record<DeliveryZone, number> = {
  'inside-dhaka': 70,
  'outside-dhaka': 130,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('inside-dhaka');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastOrder, setLastOrder] = useState<OrderSubmission | null>(null);
  const [showCartToast, setShowCartToast] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  const triggerCartToast = () => {
    setShowCartToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowCartToast(false);
    }, 2500);
  };

  const isCartLoaded = useRef(false);

  // Load cart from localStorage on client mount & sync category from URL
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unnoto_khabar_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure every item has a unique id
        const sanitized: CartItem[] = parsed.map((item: CartItem) => ({
          ...item,
          id: item.id || `${item.productId}_${item.variantId}`,
          productName: (item.productName || '').replace(/\s*\([^)]*\)/g, '').trim(),
        }));
        setCartItems(sanitized);
      }
      const savedZone = localStorage.getItem('unnoto_khabar_zone');
      if (savedZone === 'inside-dhaka' || savedZone === 'outside-dhaka') {
        setDeliveryZone(savedZone);
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      isCartLoaded.current = true;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) {
        setSelectedCategory(cat);
      }
    }
  }, []);

  // Listen to browser back/forward (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      setSelectedCategory(cat || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL search params when selectedCategory changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const url = new URL(window.location.href);
    const currentParam = url.searchParams.get('category');

    if (selectedCategory) {
      if (currentParam !== selectedCategory) {
        url.searchParams.set('category', selectedCategory);
        window.history.pushState({ category: selectedCategory }, '', url.toString());
      }
    } else {
      if (currentParam) {
        url.searchParams.delete('category');
        const nextUrl = url.pathname + (url.search ? url.search : '');
        window.history.pushState({}, '', nextUrl);
      }
    }
  }, [selectedCategory]);

  // Save cart to localStorage (only after initial load has finished)
  useEffect(() => {
    if (!isCartLoaded.current) return;
    try {
      localStorage.setItem('unnoto_khabar_cart', JSON.stringify(cartItems));
      localStorage.setItem('unnoto_khabar_zone', deliveryZone);
    } catch {
      // Ignore localStorage errors
    }
  }, [cartItems, deliveryZone]);

  const addToCart = (item: CartItem) => {
    const itemKey = item.id || `${item.productId}_${item.variantId}`;
    const standardizedItem: CartItem = { ...item, id: itemKey };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemKey);
      if (existingIndex > -1) {
        return prev.map((i, idx) =>
          idx === existingIndex
            ? { ...i, quantity: i.quantity + standardizedItem.quantity }
            : i
        );
      }
      return [...prev, standardizedItem];
    });
    triggerCartToast();
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    setCheckoutItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
    setCheckoutItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
    if (delta > 0 && !isQuickOrderOpen) {
      triggerCartToast();
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCheckoutItems([]);
  };

  const openQuickOrder = (itemOrItems?: CartItem | CartItem[]) => {
    if (!itemOrItems) {
      // No items specified -> checkout all items in cart
      setCheckoutItems([...cartItems]);
    } else if (Array.isArray(itemOrItems)) {
      setCheckoutItems([...itemOrItems]);
    } else {
      setCheckoutItems([{ ...itemOrItems }]);
    }
    setIsQuickOrderOpen(true);
  };

  const closeQuickOrder = () => {
    setIsQuickOrderOpen(false);
    setCheckoutItems([]);
  };

  const navigateToCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge = cartItems.length === 0 ? 0 : DELIVERY_RATES[deliveryZone];
  const total = subtotal + deliveryCharge;
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const amountToFreeShipping = 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isQuickOrderOpen,
        checkoutItems,
        openQuickOrder,
        closeQuickOrder,
        deliveryZone,
        setDeliveryZone,
        deliveryCharge,
        subtotal,
        total,
        cartCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
        selectedCategory,
        setSelectedCategory,
        navigateToCategory,
        searchQuery,
        setSearchQuery,
        lastOrder,
        setLastOrder,
        showCartToast,
        setShowCartToast,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
