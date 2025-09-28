import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Product } from '../types/product.types';

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  special_instructions?: string;
  // Pizza-specific fields
  pizza_size?: string;
  pizza_crust?: string;
  toppings?: string[];
  // Customization details (JSON structure)
  customization_details?: any;
  // Product details for display
  product?: Product;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (product: Product, quantity?: number, options?: {
    special_instructions?: string;
    pizza_size?: string;
    pizza_crust?: string;
    toppings?: string[];
  }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemOptions: (itemId: string, options: {
    special_instructions?: string;
    pizza_size?: string;
    pizza_crust?: string;
    toppings?: string[];
  }) => void;
  clearCart: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed values
  getItemById: (itemId: string) => CartItem | undefined;
  getItemByProductId: (productId: string) => CartItem | undefined;
  calculateTotals: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      deliveryFee: 50, // Fixed delivery fee
      tax: 0,
      total: 0,
      isLoading: false,
      error: null,

      addItem: (product, quantity = 1, options = {}) => {
        const state = get();
        const existingItem = state.getItemByProductId(product.id);
        
        if (existingItem) {
          // Update existing item quantity
          state.updateQuantity(existingItem.id, existingItem.quantity + quantity);
          return;
        }

        // Create customization_details JSON for pizza items
        const customization_details = (options.pizza_size || options.pizza_crust || options.toppings) ? {
          size: options.pizza_size,
          crust: options.pizza_crust,
          toppings: options.toppings || []
        } : undefined;

        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          unit_price: product.price || product.base_price,
          quantity,
          total_price: (product.price || product.base_price) * quantity,
          special_instructions: options.special_instructions,
          pizza_size: options.pizza_size,
          pizza_crust: options.pizza_crust,
          toppings: options.toppings,
          customization_details,
          product,
        };

        set((state) => {
          const newItems = [...state.items, newItem];
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });

        get().calculateTotals();
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== itemId);
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const newItems = state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity, total_price: item.unit_price * quantity }
              : item
          );
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
        get().calculateTotals();
      },

      updateItemOptions: (itemId, options) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, ...options }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          subtotal: 0,
          tax: 0,
          total: 0,
          error: null,
        });
      },

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      getItemById: (itemId) => {
        return get().items.find(item => item.id === itemId);
      },

      getItemByProductId: (productId) => {
        return get().items.find(item => item.product_id === productId);
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.total_price, 0);
        const tax = subtotal * 0.12; // 12% tax
        const total = subtotal + state.deliveryFee + tax;

        set({
          subtotal,
          tax,
          total,
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        deliveryFee: state.deliveryFee,
        tax: state.tax,
        total: state.total,
      }),
    }
  )
);

export const useCart = () => {
  const store = useCartStore();
  
  // Recalculate totals when items change
  React.useEffect(() => {
    store.calculateTotals();
  }, [store.items]);

  return store;
};

// Additional utility hooks
export const useCartItem = (itemId: string) => {
  const getItemById = useCartStore(state => state.getItemById);
  return getItemById(itemId);
};

export const useCartTotals = () => {
  return useCartStore(state => ({
    totalItems: state.totalItems,
    subtotal: state.subtotal,
    deliveryFee: state.deliveryFee,
    tax: state.tax,
    total: state.total,
  }));
};

export const useCartActions = () => {
  return useCartStore(state => ({
    addItem: state.addItem,
    removeItem: state.removeItem,
    updateQuantity: state.updateQuantity,
    updateItemOptions: state.updateItemOptions,
    clearCart: state.clearCart,
    setError: state.setError,
    setLoading: state.setLoading,
  }));
};

// Cart validation hook
export const useCartValidation = () => {
  const items = useCartStore(state => state.items);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateCart = useCallback(() => {
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push('Cart is empty');
    }

    // Check for items with zero quantity
    const invalidItems = items.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      errors.push('Some items have invalid quantities');
    }

    // Check for items with missing required fields
    const incompleteItems = items.filter(item => 
      !item.product_id || !item.product_name || !item.unit_price
    );
    if (incompleteItems.length > 0) {
      errors.push('Some items are missing required information');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [items]);

  useEffect(() => {
    validateCart();
  }, [validateCart]);

  return {
    validationErrors,
    isValid: validationErrors.length === 0,
    validateCart,
  };
};

// Cart persistence hook
export const useCartPersistence = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for cart to be hydrated from storage
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  return { isHydrated };
};
