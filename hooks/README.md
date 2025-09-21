# Hooks Implementation

This directory contains all the custom React hooks for the KitchenOneApp, following the patterns established in the GitHub repository. These hooks provide a clean interface between the React components and the Supabase backend.

## Architecture Overview

The hooks are organized by domain and follow these patterns:

1. **Service Layer**: Each hook wraps service calls with loading states and error handling
2. **Real-time Updates**: Most hooks include Supabase real-time subscriptions
3. **Type Safety**: Full TypeScript integration with database types
4. **State Management**: Zustand for global state, React state for local state
5. **Error Handling**: Consistent error handling and user feedback

## Hook Categories

### Authentication Hooks

#### `useAuth`
Global authentication state management using Zustand.

```typescript
const { session, profile, isLoading, signIn, signOut } = useAuth();
```

#### `useAuthActions`
Authentication actions with loading states.

```typescript
const { signIn, signUp, resetPassword, updateProfile, isLoading, error } = useAuthActions();
```

#### `useProfile`
User profile management.

```typescript
const { profile, isLoading, error, refresh, updateProfile } = useProfile(userId);
```

### Product Hooks

#### `useProducts`
Fetch and manage products with real-time updates.

```typescript
const { products, isLoading, error, refresh } = useProducts(filters);
```

#### `useProduct`
Fetch a single product with real-time updates.

```typescript
const { product, isLoading, error, refresh } = useProduct(productId);
```

#### `useProductCategories`
Manage product categories.

```typescript
const { categories, isLoading, error, refresh } = useProductCategories();
```

#### `useProductSearch`
Search products with debouncing.

```typescript
const { searchResults, isLoading, error, searchProducts } = useProductSearch(query);
```

### Order Hooks

#### `useOrders`
Fetch user orders with real-time updates.

```typescript
const { orders, isLoading, error, refresh } = useOrders(filters);
```

#### `useOrder`
Fetch a single order with real-time updates.

```typescript
const { order, isLoading, error, refresh } = useOrder(orderId);
```

#### `useCreateOrder`
Create new orders.

```typescript
const { createOrder, isLoading, error } = useCreateOrder();
```

#### `useOrderTracking`
Track order status changes.

```typescript
const { tracking, isLoading, error, refresh } = useOrderTracking(orderId);
```

### Cart Hooks

#### `useCart`
Global cart state management with persistence.

```typescript
const { 
  items, 
  totalItems, 
  subtotal, 
  total, 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart 
} = useCart();
```

#### `useCartValidation`
Validate cart before checkout.

```typescript
const { validationErrors, isValid, validateCart } = useCartValidation();
```

### Address Hooks

#### `useAddresses`
Manage delivery addresses.

```typescript
const { addresses, isLoading, error, refresh } = useAddresses();
```

#### `useCreateAddress`
Create new addresses.

```typescript
const { createAddress, isLoading, error } = useCreateAddress();
```

#### `useAddressValidation`
Validate address forms.

```typescript
const { validationErrors, isValid, validateAddress } = useAddressValidation();
```

### Saved Products Hooks

#### `useSavedProducts`
Manage saved/favorite products.

```typescript
const { savedProducts, isLoading, error, refresh } = useSavedProducts();
```

#### `useToggleSaveProduct`
Toggle product save status.

```typescript
const { toggleSaveProduct, isLoading, error } = useToggleSaveProduct();
```

### Admin Hooks

#### `useAdminStats`
Comprehensive admin dashboard statistics.

```typescript
const { stats, isLoading, error, refresh } = useAdminStats();
```

#### `useAdminOrders`
Admin order management.

```typescript
const { orders, isLoading, error, refresh } = useAdminOrders(filters);
```

### Delivery Hooks

#### `useAvailableOrders`
Fetch orders available for delivery.

```typescript
const { orders, isLoading, error, refresh } = useAvailableOrders();
```

#### `useMyDeliveryOrders`
Fetch assigned delivery orders.

```typescript
const { orders, isLoading, error, refresh } = useMyDeliveryOrders();
```

#### `useDeliveryEarnings`
Track delivery earnings.

```typescript
const { earnings, isLoading, error, refresh } = useDeliveryEarnings();
```

## Real-time Features

Most hooks include real-time updates using Supabase subscriptions:

```typescript
// Automatic real-time updates
const { products } = useProducts(); // Updates when products change
const { orders } = useOrders(); // Updates when orders change
```

## Error Handling

All hooks provide consistent error handling:

```typescript
const { data, isLoading, error, refresh } = useSomeHook();

if (error) {
  // Handle error
  console.error(error);
}

if (isLoading) {
  // Show loading state
  return <LoadingSpinner />;
}
```

## State Management

### Global State (Zustand)
- Authentication state (`useAuth`)
- Cart state (`useCart`)

### Local State (React)
- Loading states
- Error states
- Form validation

## Type Safety

All hooks are fully typed with TypeScript:

```typescript
import { Product, Order, Address } from '../types';

const { products }: { products: Product[] } = useProducts();
```

## Best Practices

1. **Always handle loading and error states**
2. **Use real-time subscriptions for live data**
3. **Validate data before making API calls**
4. **Clean up subscriptions on unmount**
5. **Use TypeScript for type safety**
6. **Follow the established patterns for consistency**

## Usage Examples

### Basic Product List
```typescript
import { useProducts } from '../hooks';

function ProductList() {
  const { products, isLoading, error } = useProducts();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Cart Management
```typescript
import { useCart, useCartValidation } from '../hooks';

function CartPage() {
  const { items, total, addItem, removeItem, clearCart } = useCart();
  const { validationErrors, isValid } = useCartValidation();
  
  return (
    <div>
      {items.map(item => (
        <CartItem 
          key={item.id} 
          item={item} 
          onRemove={() => removeItem(item.id)}
        />
      ))}
      <div>Total: ${total}</div>
      {!isValid && <ValidationErrors errors={validationErrors} />}
    </div>
  );
}
```

### Real-time Order Tracking
```typescript
import { useOrder, useOrderTracking } from '../hooks';

function OrderDetails({ orderId }) {
  const { order, isLoading } = useOrder(orderId);
  const { tracking } = useOrderTracking(orderId);
  
  return (
    <div>
      <h2>Order #{order?.order_number}</h2>
      <div>Status: {order?.status}</div>
      <div>Tracking:</div>
      {tracking.map(entry => (
        <div key={entry.id}>
          {entry.status} - {entry.timestamp}
        </div>
      ))}
    </div>
  );
}
```

This implementation provides a robust, type-safe, and real-time enabled interface between your React components and the Supabase backend, following the patterns established in the GitHub repository.
