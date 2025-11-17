# UML Class Diagram Plan for Kitchen One App
## Lucid Chart Implementation Guide

This document provides a comprehensive plan for creating a UML class diagram in Lucid Chart that visualizes the Kitchen One App database schema and operations.

---

## 📋 Table of Contents
1. [Core User Management Tables](#1-core-user-management-tables)
2. [Product Management Tables](#2-product-management-tables)
3. [Order Management Tables](#3-order-management-tables)
4. [Payment & Transaction Tables](#4-payment--transaction-tables)
5. [Delivery Management Tables](#5-delivery-management-tables)
6. [System & Support Tables](#6-system--support-tables)
7. [Relationships Overview](#7-relationships-overview)
8. [Lucid Chart Setup Instructions](#8-lucid-chart-setup-instructions)

---

## 1. Core User Management Tables

### 1.1 Profiles
**Class Name:** `Profiles`

**Attributes:**
- `id: UUID` (PK)
- `username: String` (UNIQUE)
- `full_name: String`
- `phone_number: String`
- `role: Enum` (customer, admin, delivery)
- `avatar_url: String`
- `email_verified: Boolean`
- `phone_verified: Boolean`
- `is_blocked: Boolean`
- `preferences: JSONB`
- `created_at: Timestamp`
- `updated_at: Timestamp`
- `last_login: Timestamp`

**Operations (Methods):**
- `getUsers(filters): User[]` - Get all users with optional filters
- `getUserById(userId): User` - Get user by ID
- `updateUser(userId, updates): User` - Update user profile
- `blockUser(userId): User` - Block a user
- `unblockUser(userId): User` - Unblock a user
- `changeUserRole(userId, newRole): User` - Change user role
- `getUserStats(): UserStats` - Get user statistics
- `searchUsers(query): User[]` - Search users by name/phone
- `getUsersByRole(role): User[]` - Get users filtered by role

**Relationships:**
- One-to-Many → `Addresses`
- One-to-Many → `Orders`
- One-to-Many → `SavedProducts`
- One-to-Many → `Notifications`
- One-to-Many → `Riders`
- One-to-Many → `UserPreferences`
- One-to-Many → `UserInteractions`
- One-to-Many → `InventoryTransactions` (performed_by)
- One-to-Many → `ImageMetadata` (uploaded_by, verified_by)

---

### 1.2 Addresses
**Class Name:** `Addresses`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles)
- `label: String`
- `full_address: String`
- `is_default: Boolean`
- `created_at: Timestamp`

**Operations:**
- `getUserAddresses(userId): Address[]` - Get all addresses for a user
- `getAddressById(addressId): Address` - Get address by ID
- `createAddress(userId, addressData): Address` - Create new address
- `updateAddress(addressId, updates): Address` - Update address
- `deleteAddress(addressId): void` - Delete address
- `setDefaultAddress(userId, addressId): Address` - Set default address

**Relationships:**
- Many-to-One → `Profiles` (user_id)

---

### 1.3 SavedProducts
**Class Name:** `SavedProducts`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles)
- `product_id: UUID` (FK → Products)
- `created_at: Timestamp`

**Operations:**
- `getSavedProducts(userId): SavedProduct[]` - Get user's saved products
- `saveProduct(userId, productId): SavedProduct` - Save a product
- `removeSavedProduct(userId, productId): void` - Remove saved product
- `isProductSaved(userId, productId): Boolean` - Check if product is saved

**Relationships:**
- Many-to-One → `Profiles` (user_id)
- Many-to-One → `Products` (product_id)

---

### 1.4 UserPreferences
**Class Name:** `UserPreferences`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles)
- `preference_key: String`
- `preference_value: JSONB`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `getUserPreferences(userId): UserPreference[]` - Get all user preferences
- `getPreference(userId, key): JSONB` - Get specific preference
- `setPreference(userId, key, value): UserPreference` - Set preference
- `deletePreference(userId, key): void` - Delete preference

**Relationships:**
- Many-to-One → `Profiles` (user_id)

---

### 1.5 UserInteractions
**Class Name:** `UserInteractions`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles, nullable)
- `product_id: UUID` (FK → Products, nullable)
- `interaction_type: Enum` (view, click, add_to_cart, purchase, favorite)
- `session_id: String`
- `metadata: JSONB`
- `created_at: Timestamp`

**Operations:**
- `logInteraction(userId, productId, type, metadata): void` - Log user interaction
- `getUserInteractions(userId, type?): Interaction[]` - Get user interactions
- `getProductInteractions(productId): Interaction[]` - Get product interactions
- `getRecommendationData(userId): JSONB` - Get data for recommendations

**Relationships:**
- Many-to-One → `Profiles` (user_id)
- Many-to-One → `Products` (product_id)

---

## 2. Product Management Tables

### 2.1 Categories
**Class Name:** `Categories`

**Attributes:**
- `id: UUID` (PK)
- `name: String` (UNIQUE)
- `description: String`
- `created_at: Timestamp`

**Operations:**
- `getCategories(): Category[]` - Get all categories
- `getCategoryById(categoryId): Category` - Get category by ID
- `createCategory(categoryData): Category` - Create new category
- `updateCategory(categoryId, updates): Category` - Update category
- `deleteCategory(categoryId): void` - Delete category
- `findOrCreateCategory(name, description?): Category` - Find or create category

**Relationships:**
- One-to-Many → `Products` (category_id)

---

### 2.2 Products
**Class Name:** `Products`

**Attributes:**
- `id: UUID` (PK)
- `name: String`
- `description: String`
- `category_id: UUID` (FK → Categories)
- `base_price: Decimal`
- `image_url: String`
- `gallery_image_urls: String[]`
- `is_available: Boolean`
- `is_recommended: Boolean`
- `is_featured: Boolean`
- `preparation_time_minutes: Integer`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `getProducts(filters?): Product[]` - Get all products with filters
- `getProductsLite(filters?): Product[]` - Get lightweight product list
- `getProductById(productId): Product` - Get product by ID
- `createProduct(productData): Product` - Create new product
- `updateProduct(productId, updates): Product` - Update product
- `deleteProduct(productId): void` - Delete product
- `toggleAvailability(productId): Product` - Toggle availability
- `searchProducts(query): Product[]` - Search products
- `getProductStats(): ProductStats` - Get product statistics
- `getLowStockProducts(): Product[]` - Get low stock products

**Relationships:**
- Many-to-One → `Categories` (category_id)
- One-to-Many → `ProductStock`
- One-to-Many → `PizzaOptions`
- One-to-Many → `OrderItems`
- One-to-Many → `SavedProducts`
- One-to-Many → `UserInteractions`
- One-to-Many → `ProductCoOccurrences` (product_a_id, product_b_id)
- One-to-Many → `InventoryTransactions`

---

### 2.3 ProductStock
**Class Name:** `ProductStock`

**Attributes:**
- `id: UUID` (PK)
- `product_id: UUID` (FK → Products, UNIQUE)
- `quantity: Integer`
- `low_stock_threshold: Integer`
- `last_updated_at: Timestamp`

**Operations:**
- `getProductStock(productId): ProductStock` - Get stock for product
- `updateProductStock(productId, updates, options?): ProductStock` - Update stock
- `decrementStock(productId, quantity): ProductStock` - Decrement stock
- `incrementStock(productId, quantity): ProductStock` - Increment stock
- `checkLowStock(): Product[]` - Check for low stock products

**Relationships:**
- One-to-One → `Products` (product_id)

---

### 2.4 PizzaOptions
**Class Name:** `PizzaOptions`

**Attributes:**
- `id: UUID` (PK)
- `product_id: UUID` (FK → Products)
- `size: String`
- `price: Decimal`
- `crust_id: UUID` (FK → Crusts)

**Operations:**
- `getPizzaOptions(productId): PizzaOption[]` - Get options for product
- `getPizzaOptionById(optionId): PizzaOption` - Get option by ID
- `createPizzaOption(optionData): PizzaOption` - Create new option
- `updatePizzaOption(optionId, updates): PizzaOption` - Update option
- `deletePizzaOption(optionId): void` - Delete option

**Relationships:**
- Many-to-One → `Products` (product_id)
- Many-to-One → `Crusts` (crust_id)
- One-to-Many → `PizzaToppingOptions`
- One-to-Many → `OrderItems` (pizza_option_id)

---

### 2.5 Crusts
**Class Name:** `Crusts`

**Attributes:**
- `id: UUID` (PK)
- `name: String`

**Operations:**
- `getCrusts(): Crust[]` - Get all crusts
- `getCrustById(crustId): Crust` - Get crust by ID
- `createCrust(name): Crust` - Create new crust
- `updateCrust(crustId, name): Crust` - Update crust
- `deleteCrust(crustId): void` - Delete crust

**Relationships:**
- One-to-Many → `PizzaOptions` (crust_id)

---

### 2.6 Toppings
**Class Name:** `Toppings`

**Attributes:**
- `id: UUID` (PK)
- `name: String`

**Operations:**
- `getToppings(): Topping[]` - Get all toppings
- `getToppingById(toppingId): Topping` - Get topping by ID
- `createTopping(name): Topping` - Create new topping
- `updateTopping(toppingId, name): Topping` - Update topping
- `deleteTopping(toppingId): void` - Delete topping

**Relationships:**
- One-to-Many → `PizzaToppingOptions`
- One-to-Many → `OrderItemToppings`

---

### 2.7 PizzaToppingOptions
**Class Name:** `PizzaToppingOptions`

**Attributes:**
- `id: UUID` (PK)
- `pizza_option_id: UUID` (FK → PizzaOptions)
- `topping_id: UUID` (FK → Toppings)

**Operations:**
- `getToppingsForOption(pizzaOptionId): Topping[]` - Get available toppings
- `addToppingToOption(pizzaOptionId, toppingId): void` - Add topping
- `removeToppingFromOption(pizzaOptionId, toppingId): void` - Remove topping

**Relationships:**
- Many-to-One → `PizzaOptions` (pizza_option_id)
- Many-to-One → `Toppings` (topping_id)

---

### 2.8 Slices
**Class Name:** `Slices`

**Attributes:**
- `id: UUID` (PK)
- `name: String` (UNIQUE)
- `description: String`
- `is_active: Boolean`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `getSlices(): Slice[]` - Get all slices
- `getSliceById(sliceId): Slice` - Get slice by ID
- `createSlice(sliceData): Slice` - Create new slice
- `updateSlice(sliceId, updates): Slice` - Update slice
- `deleteSlice(sliceId): void` - Delete slice

**Relationships:**
- One-to-Many → `OrderItems` (slice_id)

---

### 2.9 ProductCoOccurrences
**Class Name:** `ProductCoOccurrences`

**Attributes:**
- `id: UUID` (PK)
- `product_a_id: UUID` (FK → Products)
- `product_b_id: UUID` (FK → Products)
- `co_occurrence_count: Integer`
- `last_updated: Timestamp`

**Operations:**
- `updateCoOccurrence(productAId, productBId): void` - Update co-occurrence
- `getRecommendedProducts(productId, limit): Product[]` - Get recommendations
- `getTopCoOccurrences(productId): ProductCoOccurrence[]` - Get top co-occurrences

**Relationships:**
- Many-to-One → `Products` (product_a_id)
- Many-to-One → `Products` (product_b_id)

---

### 2.10 InventoryTransactions
**Class Name:** `InventoryTransactions`

**Attributes:**
- `id: UUID` (PK)
- `product_id: UUID` (FK → Products)
- `transaction_type: String` (IN, OUT, ADJUSTMENT)
- `quantity: Integer`
- `reason: String`
- `performed_by: UUID` (FK → Profiles)
- `created_at: Timestamp`

**Operations:**
- `logTransaction(productId, type, quantity, reason, performedBy): void` - Log transaction
- `getProductTransactions(productId): Transaction[]` - Get product history
- `getInventoryHistory(filters?): Transaction[]` - Get all transactions

**Relationships:**
- Many-to-One → `Products` (product_id)
- Many-to-One → `Profiles` (performed_by)

---

## 3. Order Management Tables

### 3.1 Orders
**Class Name:** `Orders`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles)
- `order_number: String` (UNIQUE)
- `delivery_address_id: UUID` (FK → Addresses, nullable)
- `total_amount: Decimal`
- `status: Enum` (pending, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled)
- `payment_method: String` (cod, gcash)
- `payment_status: Enum` (pending, verified, failed, refunded)
- `fulfillment_type: Enum` (delivery, pickup)
- `order_notes: String`
- `customer_notes: String`
- `admin_notes: String`
- `proof_of_payment_url: String`
- `proof_of_delivery_url: String`
- `payment_verified: Boolean`
- `payment_verified_at: Timestamp`
- `payment_verified_by: UUID` (FK → Profiles)
- `estimated_delivery_time: Timestamp`
- `actual_delivery_time: Timestamp`
- `pickup_ready_at: Timestamp`
- `picked_up_at: Timestamp`
- `pickup_verified_at: Timestamp`
- `pickup_verified_by: UUID` (FK → Profiles)
- `pickup_location_snapshot: String`
- `pickup_notes: String`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `createOrder(orderData): Order` - Create new order
- `getOrderById(orderId): Order` - Get order by ID
- `getUserOrders(userId, filters?): Order[]` - Get user's orders
- `getAdminOrders(filters?): Order[]` - Get all orders (admin)
- `updateOrderStatus(orderId, status, updatedBy, notes?): void` - Update status
- `cancelOrder(orderId, reason, cancelledBy): void` - Cancel order
- `verifyPayment(orderId, verifiedBy): void` - Verify GCash payment
- `verifyCODPayment(orderId, verifiedBy): void` - Verify COD payment
- `markOrderDelivered(orderId, userId, proofUri?): Result` - Mark as delivered
- `uploadDeliveryProof(orderId, userId, proofUri): Result` - Upload proof
- `getOrderStats(): OrderStats` - Get order statistics
- `getRiderStats(riderId): OrderStats` - Get rider statistics
- `getOrderTracking(orderId): OrderTracking[]` - Get order history
- `getOrderProofImages(orderId): ImageData` - Get proof images
- `subscribeToOrderUpdates(orderId, callback): Subscription` - Real-time updates

**Relationships:**
- Many-to-One → `Profiles` (user_id, payment_verified_by, pickup_verified_by)
- Many-to-One → `Addresses` (delivery_address_id)
- One-to-Many → `OrderItems`
- One-to-Many → `DeliveryAssignments`
- One-to-Many → `PaymentTransactions`
- One-to-Many → `OrderStatusHistory`
- One-to-Many → `OrderNotes`
- One-to-Many → `ImageMetadata`
- One-to-Many → `Notifications` (related_order_id)

---

### 3.2 OrderItems
**Class Name:** `OrderItems`

**Attributes:**
- `id: UUID` (PK)
- `order_id: UUID` (FK → Orders)
- `product_id: UUID` (FK → Products)
- `pizza_option_id: UUID` (FK → PizzaOptions, nullable)
- `slice_id: UUID` (FK → Slices, nullable)
- `quantity: Integer`
- `unit_price: Decimal`
- `selected_size: String`
- `customization_details: JSONB`
- `created_at: Timestamp`

**Operations:**
- `createOrderItems(orderId, items): OrderItem[]` - Create order items
- `getOrderItems(orderId): OrderItem[]` - Get items for order
- `getOrderItemById(itemId): OrderItem` - Get item by ID
- `updateOrderItem(itemId, updates): OrderItem` - Update item
- `deleteOrderItem(itemId): void` - Delete item

**Relationships:**
- Many-to-One → `Orders` (order_id)
- Many-to-One → `Products` (product_id)
- Many-to-One → `PizzaOptions` (pizza_option_id)
- Many-to-One → `Slices` (slice_id)
- One-to-Many → `OrderItemToppings`

---

### 3.3 OrderItemToppings
**Class Name:** `OrderItemToppings`

**Attributes:**
- `id: UUID` (PK)
- `order_item_id: UUID` (FK → OrderItems)
- `topping_id: UUID` (FK → Toppings)

**Operations:**
- `addToppingToItem(orderItemId, toppingId): void` - Add topping
- `removeToppingFromItem(orderItemId, toppingId): void` - Remove topping
- `getItemToppings(orderItemId): Topping[]` - Get toppings for item

**Relationships:**
- Many-to-One → `OrderItems` (order_item_id)
- Many-to-One → `Toppings` (topping_id)

---

### 3.4 OrderStatusHistory
**Class Name:** `OrderStatusHistory`

**Attributes:**
- `id: UUID` (PK)
- `order_id: UUID` (FK → Orders)
- `status: String`
- `changed_by: UUID` (FK → Profiles, nullable)
- `notes: String`
- `created_at: Timestamp`

**Operations:**
- `addStatusHistory(orderId, status, changedBy, notes?): void` - Add history entry
- `getStatusHistory(orderId): StatusHistory[]` - Get order history
- `getStatusChangesByUser(userId): StatusHistory[]` - Get user's changes

**Relationships:**
- Many-to-One → `Orders` (order_id)
- Many-to-One → `Profiles` (changed_by)

---

### 3.5 OrderNotes
**Class Name:** `OrderNotes`

**Attributes:**
- `id: UUID` (PK)
- `order_id: UUID` (FK → Orders)
- `note: String`
- `added_by: UUID` (FK → Profiles)
- `note_type: String` (general, admin, customer, delivery)
- `created_at: Timestamp`

**Operations:**
- `addOrderNote(orderId, note, addedBy, noteType?): OrderNote` - Add note
- `getOrderNotes(orderId): OrderNote[]` - Get notes for order
- `updateOrderNote(noteId, note): OrderNote` - Update note
- `deleteOrderNote(noteId): void` - Delete note

**Relationships:**
- Many-to-One → `Orders` (order_id)
- Many-to-One → `Profiles` (added_by)

---

## 4. Payment & Transaction Tables

### 4.1 PaymentTransactions
**Class Name:** `PaymentTransactions`

**Attributes:**
- `id: UUID` (PK)
- `order_id: UUID` (FK → Orders)
- `amount: Decimal`
- `payment_method: String`
- `status: Enum` (pending, verified, failed, refunded)
- `transaction_reference: String`
- `proof_of_payment_url: String`
- `qr_code_url: String`
- `qr_code_data: String`
- `qr_code_expires_at: Timestamp`
- `verified_by: UUID` (FK → Profiles, nullable)
- `verified_at: Timestamp`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `createPaymentTransaction(orderId, paymentData): PaymentTransaction` - Create transaction
- `getPaymentTransaction(orderId): PaymentTransaction` - Get transaction for order
- `updatePaymentStatus(transactionId, status, verifiedBy?): void` - Update status
- `verifyPayment(transactionId, verifiedBy): void` - Verify payment
- `generateQRCode(orderId, amount): QRCodeData` - Generate QR code
- `uploadPaymentProof(transactionId, proofUri): String` - Upload proof

**Relationships:**
- Many-to-One → `Orders` (order_id)
- Many-to-One → `Profiles` (verified_by)

---

## 5. Delivery Management Tables

### 5.1 Riders
**Class Name:** `Riders`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles)
- `vehicle_number: String`
- `is_available: Boolean`
- `current_location: JSONB`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `getRiderProfile(userId): Rider` - Get rider profile
- `createRiderProfile(userId, vehicleNumber?): Rider` - Create rider profile
- `updateRiderAvailability(riderId, isAvailable, location?): void` - Update availability
- `getRiderStats(riderId): RiderStats` - Get rider statistics
- `getRiderEarnings(riderId): EarningsData` - Get earnings data
- `getAvailableRiders(): Rider[]` - Get available riders
- `getRiderCurrentOrderCount(riderId): Integer` - Get active order count

**Relationships:**
- Many-to-One → `Profiles` (user_id)
- One-to-Many → `DeliveryAssignments`

---

### 5.2 DeliveryAssignments
**Class Name:** `DeliveryAssignments`

**Attributes:**
- `id: UUID` (PK)
- `order_id: UUID` (FK → Orders)
- `rider_id: UUID` (FK → Riders, nullable)
- `status: Enum` (Assigned, Picked Up, In Transit, Delivered, Failed)
- `assigned_at: Timestamp`
- `picked_up_at: Timestamp`
- `delivered_at: Timestamp`
- `notes: String`

**Operations:**
- `createAssignment(orderId, riderId?): DeliveryAssignment` - Create assignment
- `getAssignmentByOrder(orderId): DeliveryAssignment` - Get assignment
- `getRiderAssignments(riderId): DeliveryAssignment[]` - Get rider's assignments
- `getActiveAssignments(riderId): DeliveryAssignment[]` - Get active assignments
- `updateAssignmentStatus(assignmentId, status, timestamp?): void` - Update status
- `markPickedUp(assignmentId, riderId): void` - Mark as picked up
- `markDelivered(assignmentId, riderId): void` - Mark as delivered
- `reassignOrder(orderId, newRiderId): Boolean` - Reassign order
- `autoAssignOrder(orderId): Boolean` - Auto-assign order
- `getAssignmentStats(): AssignmentStats` - Get assignment statistics

**Relationships:**
- Many-to-One → `Orders` (order_id)
- Many-to-One → `Riders` (rider_id)

---

## 6. System & Support Tables

### 6.1 Notifications
**Class Name:** `Notifications`

**Attributes:**
- `id: UUID` (PK)
- `user_id: UUID` (FK → Profiles)
- `title: String`
- `message: String`
- `type: String` (order_update, payment, delivery, system)
- `is_read: Boolean`
- `related_order_id: UUID` (FK → Orders, nullable)
- `created_at: Timestamp`

**Operations:**
- `sendNotification(notificationData): Notification` - Send notification
- `sendBulkNotification(userIds, notificationData): void` - Send to multiple users
- `getUserNotifications(userId, filters?): Notification[]` - Get user notifications
- `markAsRead(notificationId): void` - Mark as read
- `markAllAsRead(userId): void` - Mark all as read
- `deleteNotification(notificationId): void` - Delete notification
- `getUnreadCount(userId): Integer` - Get unread count
- `triggerOrderStatusNotification(order, oldStatus): void` - Trigger on status change
- `triggerPaymentNotification(order, oldStatus): void` - Trigger on payment change
- `triggerDeliveryNotification(assignment): void` - Trigger on delivery

**Relationships:**
- Many-to-One → `Profiles` (user_id)
- Many-to-One → `Orders` (related_order_id)

---

### 6.2 ImageMetadata
**Class Name:** `ImageMetadata`

**Attributes:**
- `id: UUID` (PK)
- `order_id: UUID` (FK → Orders)
- `type: Enum` (payment_proof, delivery_proof)
- `url: String`
- `thumbnail_url: String`
- `uploaded_by: UUID` (FK → Profiles)
- `uploaded_at: Timestamp`
- `metadata: JSONB`
- `verified: Boolean`
- `verified_by: UUID` (FK → Profiles, nullable)
- `verified_at: Timestamp`
- `created_at: Timestamp`
- `updated_at: Timestamp`

**Operations:**
- `uploadPaymentProof(orderId, imageUri, userId): ImageMetadata` - Upload payment proof
- `uploadDeliveryProof(orderId, imageUri, userId): ImageMetadata` - Upload delivery proof
- `uploadAvatar(userId, imageUri): ImageMetadata` - Upload avatar
- `uploadProductImage(productId, imageUri): ImageMetadata` - Upload product image
- `getOrderImages(orderId): ImageMetadata[]` - Get images for order
- `verifyImage(imageId, verifiedBy): void` - Verify image
- `deleteImage(imageId): void` - Delete image
- `getImageStats(): ImageStats` - Get image statistics
- `compressImage(imageUri): String` - Compress image
- `generateThumbnail(imageUri): String` - Generate thumbnail

**Relationships:**
- Many-to-One → `Orders` (order_id)
- Many-to-One → `Profiles` (uploaded_by, verified_by)

---

## 7. Relationships Overview

### Primary Relationships (One-to-Many)

1. **Profiles → Addresses** (1:N)
2. **Profiles → Orders** (1:N)
3. **Profiles → SavedProducts** (1:N)
4. **Profiles → Notifications** (1:N)
5. **Profiles → Riders** (1:1)
6. **Profiles → UserPreferences** (1:N)
7. **Profiles → UserInteractions** (1:N)
8. **Categories → Products** (1:N)
9. **Products → ProductStock** (1:1)
10. **Products → PizzaOptions** (1:N)
11. **Products → OrderItems** (1:N)
12. **Products → SavedProducts** (1:N)
13. **Products → UserInteractions** (1:N)
14. **Crusts → PizzaOptions** (1:N)
15. **PizzaOptions → PizzaToppingOptions** (1:N)
16. **PizzaOptions → OrderItems** (1:N)
17. **Toppings → PizzaToppingOptions** (1:N)
18. **Toppings → OrderItemToppings** (1:N)
19. **Slices → OrderItems** (1:N)
20. **Orders → OrderItems** (1:N)
21. **Orders → DeliveryAssignments** (1:N)
22. **Orders → PaymentTransactions** (1:N)
23. **Orders → OrderStatusHistory** (1:N)
24. **Orders → OrderNotes** (1:N)
25. **Orders → ImageMetadata** (1:N)
26. **Orders → Notifications** (1:N)
27. **OrderItems → OrderItemToppings** (1:N)
28. **Riders → DeliveryAssignments** (1:N)

### Foreign Key Relationships

- All tables with `user_id` reference `Profiles.id`
- All tables with `order_id` reference `Orders.id`
- All tables with `product_id` reference `Products.id`
- All tables with `rider_id` reference `Riders.id`

---

## 8. Lucid Chart Setup Instructions

### Step 1: Create New Diagram
1. Open Lucid Chart
2. Create a new document
3. Select "UML Class Diagram" template

### Step 2: Create Classes for Each Table

For each table listed above:
1. **Add Class Box:**
   - Drag "Class" shape from the shape library
   - Name it with the table name (e.g., "Profiles", "Orders")

2. **Add Attributes Section:**
   - In the class box, add an "Attributes" compartment
   - List all attributes with their types
   - Mark primary keys with `(PK)`
   - Mark foreign keys with `(FK)`
   - Mark unique constraints with `(UNIQUE)`

3. **Add Operations Section:**
   - Add an "Operations" compartment
   - List all operations/methods for that table
   - Include parameter types and return types

### Step 3: Create Relationships

1. **One-to-Many Relationships:**
   - Use "Association" line with arrow pointing to the "one" side
   - Label with relationship name
   - Add multiplicity: `1` on "one" side, `*` on "many" side

2. **One-to-One Relationships:**
   - Use "Association" line
   - Add multiplicity: `1` on both sides

3. **Foreign Key Relationships:**
   - Use "Dependency" or "Association" line
   - Point from child table to parent table
   - Label with the foreign key name

### Step 4: Organize Layout

**Suggested Layout Groups:**

1. **Top Section - User Management:**
   - Profiles
   - Addresses
   - SavedProducts
   - UserPreferences
   - UserInteractions

2. **Left Section - Product Management:**
   - Categories
   - Products
   - ProductStock
   - PizzaOptions
   - Crusts
   - Toppings
   - PizzaToppingOptions
   - Slices
   - ProductCoOccurrences
   - InventoryTransactions

3. **Center Section - Order Management:**
   - Orders (LARGE - central hub)
   - OrderItems
   - OrderItemToppings
   - OrderStatusHistory
   - OrderNotes

4. **Right Section - Payment & Delivery:**
   - PaymentTransactions
   - Riders
   - DeliveryAssignments

5. **Bottom Section - System:**
   - Notifications
   - ImageMetadata

### Step 5: Add Color Coding (Optional)

- **Blue:** User Management tables
- **Green:** Product Management tables
- **Orange:** Order Management tables
- **Purple:** Payment & Delivery tables
- **Gray:** System tables

### Step 6: Add Notes (Optional)

Add text boxes with notes explaining:
- Key business rules
- Important constraints
- Automated triggers
- Real-time subscriptions

### Step 7: Final Touches

1. Align all classes neatly
2. Ensure all relationships are clearly visible
3. Add a title: "Kitchen One App - Database Schema UML Class Diagram"
4. Add legend explaining symbols and colors
5. Export as PDF or PNG for documentation

---

## 📊 Summary Statistics

- **Total Tables:** 25
- **Total Relationships:** 28+
- **Total Operations:** 200+
- **Primary Entities:** Profiles, Products, Orders
- **Supporting Entities:** Categories, Addresses, Riders, Notifications

---

## 🎯 Key Design Patterns

1. **Service Layer Pattern:** All operations are accessed through service classes
2. **Repository Pattern:** Database operations abstracted in services
3. **Observer Pattern:** Real-time updates via Supabase subscriptions
4. **Factory Pattern:** Order creation with complex item relationships
5. **Strategy Pattern:** Different payment verification strategies (GCash vs COD)

---

**Last Updated:** 2024
**Version:** 1.0
**For:** Kitchen One App Database Schema Documentation

