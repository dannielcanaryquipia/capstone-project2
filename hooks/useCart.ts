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
  pizza_slice?: string;
  toppings?: string[];
  // Customization details (JSON structure)
  customization_details?: any;
  // Product details for display
  product?: Product;
  // Selection state
  isSelected?: boolean;
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
  
  // Selection state
  selectedItems: string[];
  selectedSubtotal: number;
  selectedTotal: number;
  
  // Actions
  addItem: (product: Product, quantity?: number, options?: {
    special_instructions?: string;
    pizza_size?: string;
    pizza_crust?: string;
    pizza_slice?: string;
    toppings?: string[];
  }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemOptions: (itemId: string, options: {
    special_instructions?: string;
    pizza_size?: string;
    pizza_crust?: string;
    pizza_slice?: string;
    toppings?: string[];
  }) => void;
  clearCart: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Selection actions
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  getSelectedItems: () => CartItem[];
  calculateSelectedTotals: () => void;
  resetDeliveryFee: () => void;
  
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
      deliveryFee: 0, // Temporary: 0, will be set from admin config later
      tax: 0,
      total: 0,
      isLoading: false,
      error: null,
      
      // Selection state
      selectedItems: [],
      selectedSubtotal: 0,
      selectedTotal: 0,

      addItem: (product, quantity = 1, options = {}) => {
        const state = get();
        
        // Check cart limit (10 items maximum)
        if (state.items.length >= 10) {
          throw new Error('Cart limit reached. You can only add up to 10 different items to your cart.');
        }
        
        // Create customization details for comparison
        const customization_details = (options.pizza_size || options.pizza_crust || options.pizza_slice || options.toppings) ? {
          product_name: product.name,
          product_image: product.image_url,
          total_price: (product.price || product.base_price) * quantity,
          special_instructions: options.special_instructions,
          pizza_size: options.pizza_size,
          pizza_crust: options.pizza_crust,
          pizza_slice: options.pizza_slice,
          toppings: options.toppings || []
        } : undefined;
        
        // Find existing item with same product ID AND same customization
        const existingItem = state.items.find(item => 
          item.product_id === product.id && 
          JSON.stringify(item.customization_details) === JSON.stringify(customization_details)
        );
        
        if (existingItem) {
          // Update existing item quantity
          state.updateQuantity(existingItem.id, existingItem.quantity + quantity);
          return;
        }

        // Use the customization_details already created above

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
          pizza_slice: options.pizza_slice,
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
          const newSelected = state.selectedItems.filter(id => id !== itemId);
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
            selectedItems: newSelected,
          };
        });
        get().calculateTotals();
        get().calculateSelectedTotals();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        // Limit quantity to maximum of 10
        const limitedQuantity = Math.min(10, quantity);

        set((state) => {
          const newItems = state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: limitedQuantity, total_price: item.unit_price * limitedQuantity }
              : item
          );
          return {
            items: newItems,
            totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        });
        get().calculateTotals();
        get().calculateSelectedTotals();
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
          selectedItems: [],
          selectedSubtotal: 0,
          selectedTotal: 0,
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
        const tax = 0; // No tax for now
        const total = subtotal + state.deliveryFee + tax;

        set({
          subtotal,
          tax,
          total,
        });
      },

      // Selection methods
      toggleItemSelection: (itemId: string) => {
        const state = get();
        const isSelected = state.selectedItems.includes(itemId);
        
        if (isSelected) {
          set({
            selectedItems: state.selectedItems.filter(id => id !== itemId)
          });
        } else {
          set({
            selectedItems: [...state.selectedItems, itemId]
          });
        }
        
        // Update item selection state
        set({
          items: state.items.map(item => 
            item.id === itemId 
              ? { ...item, isSelected: !isSelected }
              : item
          )
        });
        
        get().calculateSelectedTotals();
      },

      selectAllItems: () => {
        const state = get();
        const allItemIds = state.items.map(item => item.id);
        
        set({
          selectedItems: allItemIds,
          items: state.items.map(item => ({ ...item, isSelected: true }))
        });
        
        get().calculateSelectedTotals();
      },

      clearSelection: () => {
        const state = get();
        
        set({
          selectedItems: [],
          items: state.items.map(item => ({ ...item, isSelected: false })),
          selectedSubtotal: 0,
          selectedTotal: 0
        });
      },

      resetDeliveryFee: () => {
        set({
          deliveryFee: 0,
          tax: 0
        });
        get().calculateSelectedTotals();
      },

      getSelectedItems: () => {
        const state = get();
        return state.items.filter(item => state.selectedItems.includes(item.id));
      },

      calculateSelectedTotals: () => {
        const state = get();
        const selectedItems = state.items.filter(item => state.selectedItems.includes(item.id));
        const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.total_price, 0);
        
        // Only apply fees if there are selected items
        const hasSelection = selectedItems.length > 0;
        const selectedTax = hasSelection ? state.tax : 0;
        const selectedDeliveryFee = hasSelection ? state.deliveryFee : 0;
        const selectedTotal = selectedSubtotal + selectedDeliveryFee + selectedTax;

        set({
          selectedSubtotal,
          selectedTotal
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
    toggleItemSelection: state.toggleItemSelection,
    selectAllItems: state.selectAllItems,
    clearSelection: state.clearSelection,
    getSelectedItems: state.getSelectedItems,
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
    // Check if the store is already hydrated
    if (useCartStore.persist.hasHydrated()) {
      setIsHydrated(true);
      return;
    }

    // Wait for cart to be hydrated from storage
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Fallback: set hydrated after a short delay to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      setIsHydrated(true);
    }, 1000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return { isHydrated };
};
