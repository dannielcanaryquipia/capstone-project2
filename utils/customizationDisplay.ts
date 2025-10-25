/**
 * Utility functions for displaying order item customization details
 * Shows only essential information: size, crust, toppings, pizza size, total price
 */

export interface RefinedCustomization {
  size?: string;
  crust?: string;
  slice?: string;
  toppings?: string[];
  pizzaSize?: string;
  totalPrice?: number;
  specialInstructions?: string;
}

/**
 * Extracts and refines customization details from order item
 * Returns only essential information for display
 */
export const getRefinedCustomization = (orderItem: any): RefinedCustomization | null => {
  if (!orderItem.customization_details) return null;
  
  try {
    const details = typeof orderItem.customization_details === 'string' 
      ? JSON.parse(orderItem.customization_details) 
      : orderItem.customization_details;
    
    const refined: RefinedCustomization = {};
    
    // Extract size (from pizza_size or size field)
    if (details.pizza_size) {
      refined.pizzaSize = details.pizza_size;
    } else if (details.size) {
      refined.size = details.size;
    }
    
    // Extract crust
    if (details.pizza_crust) {
      refined.crust = details.pizza_crust;
    } else if (details.crust) {
      refined.crust = details.crust;
    }
    
    // Extract slice
    if (details.pizza_slice) {
      refined.slice = details.pizza_slice;
    }
    
    // Extract toppings (only if it's an array and not empty)
    if (details.toppings && Array.isArray(details.toppings) && details.toppings.length > 0) {
      refined.toppings = details.toppings;
    }
    
    // Extract total price
    if (details.total_price) {
      refined.totalPrice = details.total_price;
    }
    
    // Extract special instructions
    if (details.special_instructions) {
      refined.specialInstructions = details.special_instructions;
    }
    
    // Return null if no essential details found
    if (!refined.pizzaSize && !refined.size && !refined.crust && !refined.slice && !refined.toppings?.length) {
      return null;
    }
    
    return refined;
  } catch (error) {
    console.warn('Error parsing customization_details:', error);
    return null;
  }
};

/**
 * Formats size, crust, and slice information for display
 */
export const formatSizeAndCrust = (customization: RefinedCustomization): string | null => {
  const parts = [];
  
  if (customization.pizzaSize) {
    parts.push(`Size: ${customization.pizzaSize}`);
  } else if (customization.size) {
    parts.push(`Size: ${customization.size}`);
  }
  
  if (customization.crust) {
    parts.push(`Crust: ${customization.crust}`);
  }
  
  if (customization.slice) {
    parts.push(`Slice: ${customization.slice}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : null;
};

/**
 * Formats toppings for display
 */
export const formatToppings = (customization: RefinedCustomization): string | null => {
  if (!customization.toppings || customization.toppings.length === 0) {
    return null;
  }
  
  return `Toppings: ${customization.toppings.join(', ')}`;
};

/**
 * Gets a compact display string for order cards
 */
export const getCompactCustomizationDisplay = (orderItem: any): string | null => {
  const customization = getRefinedCustomization(orderItem);
  if (!customization) return null;
  
  const parts = [];
  
  // Add size and crust
  const sizeCrust = formatSizeAndCrust(customization);
  if (sizeCrust) {
    parts.push(sizeCrust);
  }
  
  // Add toppings (truncated for compact display)
  if (customization.toppings && customization.toppings.length > 0) {
    const toppingsText = customization.toppings.length > 2 
      ? `${customization.toppings.slice(0, 2).join(', ')} +${customization.toppings.length - 2} more`
      : customization.toppings.join(', ');
    parts.push(`Toppings: ${toppingsText}`);
  }
  
  return parts.length > 0 ? parts.join(' • ') : null;
};

/**
 * Gets detailed display components for order details pages
 */
export const getDetailedCustomizationDisplay = (orderItem: any) => {
  const customization = getRefinedCustomization(orderItem);
  if (!customization) return null;
  
  const displayItems = [];
  
  // Size and Crust
  const sizeCrust = formatSizeAndCrust(customization);
  if (sizeCrust) {
    displayItems.push({
      label: 'Details',
      value: sizeCrust,
      type: 'details' as const
    });
  }
  
  // Toppings
  const toppings = formatToppings(customization);
  if (toppings) {
    displayItems.push({
      label: 'Toppings',
      value: toppings,
      type: 'toppings' as const
    });
  }
  
  // Special Instructions
  if (customization.specialInstructions) {
    displayItems.push({
      label: 'Note',
      value: customization.specialInstructions,
      type: 'instructions' as const
    });
  }
  
  return displayItems.length > 0 ? displayItems : null;
};
