/**
 * Utility functions for sorting pizza sizes in a consistent order
 * 
 * Size Order: Small (10") → Medium (14") → Large (18")
 * 
 * This utility provides functions to:
 * 1. Extract and parse size information from database values
 * 2. Determine size priority for consistent ordering
 * 3. Sort sizes alphabetically by priority
 */

export interface SizeInfo {
  size: string;
  displayName: string;
  priority: number;
}

/**
 * Size priority map for consistent ordering
 * Priority: 1 = Small, 2 = Medium, 3 = Large, 0 = Unknown (last)
 */
const SIZE_PRIORITY: Record<string, number> = {
  'small': 1,
  'medium': 2,
  'large': 3,
};

/**
 * Normalizes size string to lowercase for comparison
 */
const normalizeSize = (size: string): string => {
  if (!size) return '';
  return size.toLowerCase().trim();
};

/**
 * Extracts base size name from size string
 * Examples: "Small (10")" -> "small", "Medium (14")" -> "medium"
 */
const extractBaseSize = (size: string): string => {
  const normalized = normalizeSize(size);
  
  // Check if string contains size keywords
  if (normalized.includes('small')) return 'small';
  if (normalized.includes('medium')) return 'medium';
  if (normalized.includes('large')) return 'large';
  
  // Check exact matches first
  const sizes = Object.keys(SIZE_PRIORITY);
  for (const s of sizes) {
    if (normalized === s) return s;
  }
  
  return ''; // Unknown size
};

/**
 * Gets priority value for a size (lower = appears first)
 */
export const getSizePriority = (size: string): number => {
  const baseSize = extractBaseSize(size);
  return SIZE_PRIORITY[baseSize] || 999; // Unknown sizes go last
};

/**
 * Sorts sizes by priority: Small → Medium → Large
 */
export const sortSizes = (sizes: string[]): string[] => {
  return [...sizes].sort((a, b) => {
    const priorityA = getSizePriority(a);
    const priorityB = getSizePriority(b);
    
    // If priorities are different, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If priorities are same, sort alphabetically
    return a.localeCompare(b);
  });
};

/**
 * Gets display name for a size (preserves original if it contains inches)
 */
export const getSizeDisplayName = (size: string): string => {
  return size; // Return as-is for now, can be enhanced later
};

/**
 * Checks if a size string contains size information
 */
export const isValidPizzaSize = (size: string): boolean => {
  const baseSize = extractBaseSize(size);
  return baseSize !== '' && SIZE_PRIORITY.hasOwnProperty(baseSize);
};

