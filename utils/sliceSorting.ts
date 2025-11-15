/**
 * Utility functions for sorting pizza slices (cuts) in a consistent order
 * 
 * Slice Order: 8 Regular Cut → 16 Regular Cut → 32 Square Cut
 * 
 * This utility provides functions to:
 * 1. Extract and parse slice information from database values
 * 2. Determine slice priority for consistent ordering
 * 3. Sort slices by number and type
 */

export interface SliceInfo {
  slice: string;
  displayName: string;
  priority: number;
}

/**
 * Slice priority map for consistent ordering
 * Priority: 1 = 8 Regular Cut, 2 = 16 Regular Cut, 3 = 32 Square Cut
 */
const SLICE_PRIORITY: Record<string, number> = {
  '8 regular cut': 1,
  '16 regular cut': 2,
  '32 square cut': 3,
};

/**
 * Normalizes slice string to lowercase for comparison
 */
const normalizeSlice = (slice: string): string => {
  if (!slice) return '';
  return slice.toLowerCase().trim();
};

/**
 * Extracts slice information from slice string
 * Examples: "8 Regular Cut" -> { number: 8, type: "regular cut" }
 *           "32 Square Cut" -> { number: 32, type: "square cut" }
 */
const extractSliceInfo = (slice: string): { number: number; type: string } => {
  const normalized = normalizeSlice(slice);
  
  // Extract number from the beginning of the string
  const numberMatch = normalized.match(/^(\d+)/);
  const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;
  
  // Extract type (everything after the number)
  const type = normalized.replace(/^\d+\s*/, '').trim();
  
  return { number, type };
};

/**
 * Gets priority value for a slice (lower = appears first)
 * Priority order: 8 Regular Cut (1) → 16 Regular Cut (2) → 32 Square Cut (3)
 */
export const getSlicePriority = (slice: string): number => {
  const normalized = normalizeSlice(slice);
  
  // Check exact matches first
  if (SLICE_PRIORITY[normalized]) {
    return SLICE_PRIORITY[normalized];
  }
  
  // Extract slice info for custom sorting
  const { number, type } = extractSliceInfo(slice);
  
  // If we have a number, use it as base priority
  // Then adjust based on type (Regular Cut comes before Square Cut for same number)
  if (number > 0) {
    let priority = number;
    
    // Regular Cut has lower priority (appears first) than Square Cut
    if (type.includes('square')) {
      priority += 0.5; // Square Cut comes after Regular Cut
    }
    
    return priority;
  }
  
  return 999; // Unknown slices go last
};

/**
 * Sorts slices by priority: 8 Regular Cut → 16 Regular Cut → 32 Square Cut
 */
export const sortSlices = (slices: string[]): string[] => {
  return [...slices].sort((a, b) => {
    const priorityA = getSlicePriority(a);
    const priorityB = getSlicePriority(b);
    
    // If priorities are different, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If priorities are same, sort alphabetically
    return a.localeCompare(b);
  });
};

/**
 * Gets display name for a slice (preserves original format)
 */
export const getSliceDisplayName = (slice: string): string => {
  return slice; // Return as-is for now, can be enhanced later
};

/**
 * Checks if a slice string contains valid slice information
 */
export const isValidPizzaSlice = (slice: string): boolean => {
  const { number } = extractSliceInfo(slice);
  return number > 0;
};

