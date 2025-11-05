# Pizza Size Sorting Implementation

## Overview
This document explains how pizza sizes are sorted and displayed in a consistent order: **Small (10") → Medium (14") → Large (18")**

## Problem
When fetching pizza sizes from the database, they were appearing in random order, making it difficult for users to select sizes in a logical sequence.

## Solution
Implemented a utility function that sorts pizza sizes based on their base size name (small, medium, large) regardless of how they're stored in the database.

## How It Works

### 1. Size Priority System
We assign priority values to each size:
- **Small**: Priority 1 (appears first)
- **Medium**: Priority 2 (appears second)
- **Large**: Priority 3 (appears third)
- **Unknown**: Priority 999 (appears last)

```typescript
const SIZE_PRIORITY: Record<string, number> = {
  'small': 1,
  'medium': 2,
  'large': 3,
};
```

### 2. Size Extraction
The `extractBaseSize()` function extracts the base size name from various formats:

**Examples:**
- "Small (10")" → "small"
- "Medium (14")" → "medium"
- "Large (18")" → "large"
- "small" → "small"

**How it works:**
1. Converts string to lowercase
2. Checks if it contains size keywords ("small", "medium", "large")
3. Returns the base size name

### 3. Sorting Logic
The `sortSizes()` function:
1. **Extracts base size** from each size string
2. **Gets priority value** for each size
3. **Sorts by priority** (lower numbers first)
4. **Falls back to alphabetical** if priorities are equal

```typescript
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
```

### 4. Integration in Product Detail
In the product detail page, we use the sorting function:

```typescript
const availableSizes = useMemo(() => {
  const sizes = Array.from(new Set((product.pizza_options || []).map((o: any) => o.size)));
  return sortSizes(sizes); // ✅ Now sorted
}, [product]);
```

## Example Flow

### Database Data (Unsorted)
```javascript
pizza_options: [
  { size: "Large (18")", price: 500 },
  { size: "Small (10")", price: 300 },
  { size: "Medium (14")", price: 400 }
]
```

### After Sorting
```javascript
availableSizes: [
  "Small (10")",    // Priority: 1
  "Medium (14")",   // Priority: 2
  "Large (18")"     // Priority: 3
]
```

## Benefits

1. **Consistent UI**: Sizes always appear in logical order
2. **Better UX**: Users can easily select from smallest to largest
3. **Flexible**: Works regardless of database storage format
4. **Maintainable**: Easy to add new sizes or change priorities

## Files Modified

### `utils/sizeSorting.ts`
- Created utility functions for size sorting
- Provides `sortSizes()` function for use across the app

### `app/(customer)/product/[id].tsx`
- Added `import { sortSizes } from '../../../utils/sizeSorting'`
- Applied sorting to `availableSizes` using `sortSizes()`

## Usage

To use size sorting in other parts of the app:

```typescript
import { sortSizes } from '../utils/sizeSorting';

// Sort sizes
const sortedSizes = sortSizes(['Large (18")', 'Small (10")', 'Medium (14")']);
// Result: ['Small (10")', 'Medium (14")', 'Large (18")']
```

## Testing

Test cases:
1. ✅ Handles "Small (10")" → appears first
2. ✅ Handles "Medium (14")" → appears second
3. ✅ Handles "Large (18")" → appears third
4. ✅ Handles case variations: "small", "Small", "SMALL"
5. ✅ Handles unknown sizes → appears last
6. ✅ Preserves original size display format

## Future Enhancements

Possible improvements:
1. Support for additional sizes (Extra Small, Extra Large)
2. Custom size ordering per product
3. Size-based pricing validation
4. Size availability checking

