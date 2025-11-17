# UML Class Diagram Quick Reference
## Kitchen One App - Simplified Implementation Guide

This is a condensed version for quick reference when building the diagram in Lucid Chart.

---

## 🎯 Core Entity Relationships (Simplified)

```
┌─────────────┐
│  Profiles   │ (Central User Entity)
└──────┬──────┘
       │
       ├───→ Addresses (1:N)
       ├───→ Orders (1:N)
       ├───→ SavedProducts (1:N)
       ├───→ Notifications (1:N)
       ├───→ Riders (1:1)
       ├───→ UserPreferences (1:N)
       └───→ UserInteractions (1:N)

┌─────────────┐
│  Products   │ (Central Product Entity)
└──────┬──────┘
       │
       ├───→ ProductStock (1:1)
       ├───→ PizzaOptions (1:N)
       ├───→ OrderItems (1:N)
       ├───→ SavedProducts (1:N)
       └───→ UserInteractions (1:N)

┌─────────────┐
│   Orders    │ (Central Order Entity)
└──────┬──────┘
       │
       ├───→ OrderItems (1:N)
       ├───→ DeliveryAssignments (1:N)
       ├───→ PaymentTransactions (1:N)
       ├───→ OrderStatusHistory (1:N)
       ├───→ OrderNotes (1:N)
       ├───→ ImageMetadata (1:N)
       └───→ Notifications (1:N)
```

---

## 📋 Table List with Key Operations Count

| Table Name | Operations | Key Relationships |
|------------|-----------|-------------------|
| **Profiles** | 9 | → Addresses, Orders, Riders, Notifications |
| **Addresses** | 6 | ← Profiles |
| **SavedProducts** | 4 | ← Profiles, Products |
| **UserPreferences** | 4 | ← Profiles |
| **UserInteractions** | 4 | ← Profiles, Products |
| **Categories** | 6 | → Products |
| **Products** | 10 | ← Categories, → ProductStock, PizzaOptions |
| **ProductStock** | 5 | ← Products |
| **PizzaOptions** | 5 | ← Products, Crusts |
| **Crusts** | 5 | → PizzaOptions |
| **Toppings** | 5 | → PizzaToppingOptions, OrderItemToppings |
| **PizzaToppingOptions** | 3 | ← PizzaOptions, Toppings |
| **Slices** | 5 | → OrderItems |
| **ProductCoOccurrences** | 3 | ← Products (both directions) |
| **InventoryTransactions** | 3 | ← Products, Profiles |
| **Orders** | 15 | ← Profiles, Addresses, → OrderItems, DeliveryAssignments |
| **OrderItems** | 5 | ← Orders, Products, PizzaOptions, Slices |
| **OrderItemToppings** | 3 | ← OrderItems, Toppings |
| **OrderStatusHistory** | 3 | ← Orders, Profiles |
| **OrderNotes** | 4 | ← Orders, Profiles |
| **PaymentTransactions** | 6 | ← Orders, Profiles |
| **Riders** | 7 | ← Profiles, → DeliveryAssignments |
| **DeliveryAssignments** | 9 | ← Orders, Riders |
| **Notifications** | 9 | ← Profiles, Orders |
| **ImageMetadata** | 9 | ← Orders, Profiles |

**Total: 25 Tables, 150+ Operations**

---

## 🔗 Critical Relationships to Highlight

### 1. Order Flow Relationships
```
Orders
  ├── OrderItems → Products
  ├── DeliveryAssignments → Riders → Profiles
  ├── PaymentTransactions
  └── OrderStatusHistory
```

### 2. Product Customization Relationships
```
Products
  ├── PizzaOptions → Crusts
  │   └── PizzaToppingOptions → Toppings
  └── OrderItems
      └── OrderItemToppings → Toppings
```

### 3. User Activity Relationships
```
Profiles
  ├── Orders → OrderItems → Products
  ├── SavedProducts → Products
  └── UserInteractions → Products
```

---

## 🎨 Recommended Color Scheme

| Category | Color | Tables |
|----------|-------|--------|
| **User Management** | 🔵 Blue | Profiles, Addresses, SavedProducts, UserPreferences, UserInteractions |
| **Product Management** | 🟢 Green | Categories, Products, ProductStock, PizzaOptions, Crusts, Toppings, PizzaToppingOptions, Slices, ProductCoOccurrences, InventoryTransactions |
| **Order Management** | 🟠 Orange | Orders, OrderItems, OrderItemToppings, OrderStatusHistory, OrderNotes |
| **Payment & Delivery** | 🟣 Purple | PaymentTransactions, Riders, DeliveryAssignments |
| **System** | ⚫ Gray | Notifications, ImageMetadata |

---

## 📐 Layout Suggestions

### Option 1: Hierarchical Layout
```
        [Profiles]
           |
    ┌──────┼──────┐
    │      │      │
[Addresses] [Orders] [Riders]
    │      │      │
    │   [OrderItems] [DeliveryAssignments]
    │      │
    │   [Products]
    │      │
[Categories] [ProductStock]
```

### Option 2: Grouped Layout
- **Top Row:** User Management (Profiles, Addresses, etc.)
- **Middle Left:** Product Management (Products, Categories, etc.)
- **Middle Center:** Orders (large, central)
- **Middle Right:** Payment & Delivery
- **Bottom:** System Tables (Notifications, ImageMetadata)

### Option 3: Flow-Based Layout
- Start with **Profiles** (top left)
- Flow to **Products** (top right)
- **Orders** in center (connects both)
- **Payment/Delivery** below Orders
- **System** tables at bottom

---

## 🔑 Key Operations by Category

### User Operations
- `getUsers()`, `getUserById()`, `updateUser()`, `blockUser()`, `unblockUser()`

### Product Operations
- `getProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`, `updateProductStock()`

### Order Operations
- `createOrder()`, `getOrderById()`, `updateOrderStatus()`, `verifyPayment()`, `markOrderDelivered()`

### Delivery Operations
- `getAvailableOrders()`, `acceptOrder()`, `markOrderPickedUp()`, `markOrderDelivered()`, `getRiderStats()`

### Payment Operations
- `createPaymentTransaction()`, `verifyPayment()`, `generateQRCode()`, `uploadPaymentProof()`

---

## ⚠️ Important Notes for Diagram

1. **Orders is the Central Hub** - Most relationships flow through Orders
2. **Profiles connects to everything** - User-centric system
3. **Products has complex customization** - PizzaOptions, Crusts, Toppings relationships
4. **Real-time features** - Notifications and subscriptions not shown but important
5. **Image handling** - ImageMetadata connects Orders and Profiles

---

## 🚀 Quick Start Checklist

- [ ] Create all 25 class boxes
- [ ] Add attributes to each class (at least key ones)
- [ ] Add operations to each class (at least 3-5 key ones)
- [ ] Draw relationships from Profiles
- [ ] Draw relationships from Products
- [ ] Draw relationships from Orders
- [ ] Add color coding
- [ ] Add legend
- [ ] Add title
- [ ] Review and align all elements

---

**Use this as a quick reference while building your diagram in Lucid Chart!**

