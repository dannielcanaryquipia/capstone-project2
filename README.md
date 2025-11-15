# Kitchen One App

> **A comprehensive restaurant management application** built with React Native, Expo, and Supabase. This app digitizes the operations of Kitchen One Bulan, providing food ordering, delivery tracking, inventory management, AI-powered recommendations, and role-based access control.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Complete Feature List](#-complete-feature-list)
- [Tech Stack](#-tech-stack)
- [Architecture & Logic](#-architecture--logic)
- [Database Schema](#-database-schema)
- [Services & Business Logic](#-services--business-logic)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Guide](#-development-guide)
- [Recent Updates](#-recent-updates--upgrades)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Documentation](#-documentation)

---

## 🎯 Project Overview

**Kitchen One App** is a full-featured restaurant management system that provides:

- **Multi-role Platform**: Customer, Admin, and Delivery Staff interfaces
- **Complete Order Lifecycle**: From order placement to delivery completion
- **Intelligent Systems**: AI-powered recommendations, automatic rider assignment
- **Real-time Updates**: Live order tracking, notifications, and status updates
- **Payment Processing**: Multiple payment methods with verification workflows
- **Inventory Management**: Automated stock tracking with low stock alerts
- **Comprehensive Analytics**: Sales reports, revenue tracking, performance metrics

**Technology Stack:**
- **Frontend**: React Native 0.81.4, Expo ~54.0.10, TypeScript ~5.9.2
- **Backend**: Supabase (PostgreSQL, Real-time, Storage, Authentication)
- **State Management**: Zustand, TanStack React Query
- **Navigation**: Expo Router (File-based routing)
- **UI Components**: React Native Paper, Custom Themed Components

---

## 🚀 Complete Feature List

### 👤 Customer Features (40+ Features)

#### Authentication & Account Management
- ✅ Email-based registration with validation
- ✅ Secure authentication using Supabase Auth
- ✅ Password reset functionality (forgot password flow)
- ✅ Session persistence across app restarts
- ✅ Automatic token refresh (every 5 minutes)
- ✅ Role-based access control

#### Profile Management
- ✅ User profile creation and editing
- ✅ Avatar upload with image compression
- ✅ Profile information (name, email, phone)
- ✅ Profile settings customization
- ✅ Account preferences management

#### Product Browsing & Discovery
- ✅ Category-based browsing (organized menu structure)
- ✅ Product search functionality with real-time filtering
- ✅ Product detail pages with comprehensive information
- ✅ Image gallery with zoom functionality
- ✅ Real-time availability indicators
- ✅ Stock quantity display for products
- ✅ Product recommendations based on browsing history

#### AI-Powered Recommendation System
- ✅ Featured products based on order history
- ✅ Personalized suggestions using Fisher-Yates shuffle algorithm
- ✅ Category-based recommendations with smart fallbacks
- ✅ SQL-based recommendation functions for performance
- ✅ Dynamic product ranking based on popularity
- ✅ Fallback recommendations when user history is limited

#### Product Customization
- ✅ Pizza customization options:
  - Size selection (Small, Medium, Large, etc.) with intelligent sorting
  - Crust type selection (Thin, Thick, Stuffed, etc.)
  - Topping selection (multiple toppings)
  - Slice quantity selection (for pizza slices)
- ✅ Customization display in cart and orders
- ✅ Price calculation based on selections
- ✅ Real-time price updates during customization
- ✅ Pizza slice sorting (8 Regular Cut → 16 Regular Cut → 32 Square Cut)

#### Saved Products (Favorites)
- ✅ Save favorite products for quick access
- ✅ Saved products list with easy navigation
- ✅ Quick reorder from saved products
- ✅ Remove saved products with confirmation
- ✅ Persistent saved products across sessions

#### Shopping Cart Management
- ✅ Add to cart with quantity selection
- ✅ Cart item management (increase/decrease quantity)
- ✅ Remove items from cart
- ✅ Cart persistence using AsyncStorage
- ✅ Real-time price calculation (subtotal, fees, total)
- ✅ Cart item customization display
- ✅ Select all items functionality
- ✅ Clear cart with confirmation
- ✅ Visual cart notifications when items are added
- ✅ Cart item count badge display

#### Order Management
- ✅ Checkout process with order review
- ✅ Delivery address selection (from saved addresses)
- ✅ Fulfillment type selection (Delivery or Pickup)
- ✅ Payment method selection (Cash on Delivery or GCash)
- ✅ Order summary with itemized breakdown
- ✅ Processing fee calculation
- ✅ Order confirmation before submission
- ✅ Automatic order number generation

#### Order Tracking
- ✅ Real-time order status updates:
  - Pending → Preparing → Ready for Pickup → Out for Delivery → Delivered
- ✅ Order status history tracking
- ✅ Order detail view with comprehensive information
- ✅ Delivery tracking for delivery orders
- ✅ Pickup tracking for pickup orders
- ✅ Estimated preparation time display

#### Order History
- ✅ Complete order history with filtering
- ✅ Order status filtering (all, pending, completed, cancelled)
- ✅ Date-based filtering (today, this week, this month, all time)
- ✅ Order details with full itemization
- ✅ Reorder functionality from past orders
- ✅ Order search functionality

#### Payment System
- ✅ Cash on Delivery (COD) payment option
- ✅ GCash online payment option
- ✅ Payment method selection during checkout
- ✅ Payment status tracking (pending, verified, failed)
- ✅ QR code generation for payment
- ✅ QR code display with expiration timer
- ✅ Payment proof upload:
  - Camera integration for photo capture
  - Gallery integration for image selection
  - Image compression and optimization
  - Format conversion (JPEG)
- ✅ Payment verification status tracking
- ✅ Payment confirmation notifications

#### Address Management
- ✅ Multiple address support (save multiple addresses)
- ✅ Add new address with form validation
- ✅ Edit existing address functionality
- ✅ Delete address with confirmation
- ✅ Set default address for quick checkout
- ✅ Address validation (required fields)
- ✅ Address display in orders and checkout

#### Notifications
- ✅ Order status change notifications
- ✅ Payment verification notifications
- ✅ Delivery assignment notifications
- ✅ Order ready notifications
- ✅ Delivery completion notifications
- ✅ System notifications (promotions, updates)
- ✅ Unread notification count badge
- ✅ Mark as read functionality
- ✅ Mark all as read option
- ✅ Notification history with filtering
- ✅ Notification categories (order_update, payment, delivery, system)
- ✅ Real-time notification updates via subscriptions
- ✅ Time-based notification grouping (Today, This Week, This Month, Older)

#### Help & Support
- ✅ Help & Support page with information
- ✅ Terms & Privacy documentation
- ✅ Contact information display
- ✅ FAQ system with categories
- ✅ Support request functionality

---

### 👨‍💼 Admin Features (35+ Features)

#### Dashboard & Analytics
- ✅ Real-time statistics overview:
  - Total orders (by status)
  - Revenue analytics (this month, last month, growth)
  - Product statistics (total, available, unavailable, low stock)
  - User statistics (total, new this month, active)
  - Delivery staff statistics (total, active)
- ✅ Recent activity display (orders, products, users)
- ✅ Quick action buttons for common tasks
- ✅ Real-time data updates via subscriptions

#### Reports & Analytics
- ✅ Sales reports with date range filtering
- ✅ Revenue analytics with growth metrics
- ✅ Top products tracking (best sellers)
- ✅ Performance metrics dashboard
- ✅ Order completion rate statistics
- ✅ Inventory reports with low stock alerts
- ✅ User activity reports

#### Product Management
- ✅ Add new products with comprehensive form:
  - Product name, description, price
  - Category assignment
  - Image upload with compression
  - Availability toggle
  - Preparation time
  - Allergen information
  - Nutritional information
- ✅ Edit existing products with full details
- ✅ Delete products with confirmation
- ✅ Product availability toggling
- ✅ Bulk product operations

#### Category Management
- ✅ Create categories for menu organization
- ✅ Edit categories (name, description)
- ✅ Delete categories with validation
- ✅ Category ordering

#### Pizza Customization Management
- ✅ Pizza options management (size and crust combinations)
- ✅ Crust types management (add, edit, delete)
- ✅ Toppings management (add, edit, delete)
- ✅ Topping availability per pizza option
- ✅ Price configuration for customizations

#### Product Images
- ✅ Image upload for products
- ✅ Image gallery management
- ✅ Image compression and optimization
- ✅ Multiple images per product
- ✅ Image metadata tracking

#### Inventory Management
- ✅ Stock quantity tracking per product
- ✅ Stock level updates (increase/decrease)
- ✅ Low stock threshold configuration
- ✅ Low stock alerts for admins
- ✅ Automatic stock decrement on order creation
- ✅ Stock availability sync (auto-disable when out of stock)
- ✅ Inventory transaction logging
- ✅ Current stock levels overview
- ✅ Low stock products list
- ✅ Out of stock products list

#### Order Management
- ✅ View all orders with comprehensive filters
- ✅ Order search functionality
- ✅ Status-based filtering (pending, preparing, ready, etc.)
- ✅ Order detail view with full information:
  - Customer information
  - Delivery address (for delivery orders)
  - Pickup location (for pickup orders)
  - Order items with customization
  - Payment information
  - Fulfillment type (delivery/pickup)
- ✅ Order status updates:
  - Mark as Preparing
  - Mark as Ready for Pickup
  - Cancel order
  - Update delivery status

#### Rider Assignment
- ✅ Automatic rider assignment system:
  - Distance-based scoring
  - Workload balancing
  - Rider availability consideration
  - Configurable assignment rules
- ✅ Manual rider assignment override
- ✅ Reassignment capability for orders
- ✅ Assignment statistics (assigned/unassigned orders)
- ✅ Available riders display

#### Payment Verification
- ✅ GCash payment verification:
  - View payment proof images
  - Verify payment status
  - Reject payment with reason
  - Payment transaction updates
- ✅ Payment verification workflow:
  - Review uploaded payment proof
  - Verify payment amount
  - Update payment status
  - Notify customer of verification

#### User Management
- ✅ View all users with role filtering
- ✅ User search functionality
- ✅ User profile management:
  - View user details
  - Edit user information (if allowed)
  - Block/unblock users
  - Role assignment
- ✅ User statistics (total, new, active)
- ✅ User activity tracking
- ✅ User blocklist functionality

#### Delivery Staff Management
- ✅ Rider profile management
- ✅ Rider availability monitoring
- ✅ Rider statistics (deliveries, earnings, performance)
- ✅ Rider assignment management
- ✅ Rider performance tracking

#### Image Management
- ✅ Image gallery management
- ✅ Image upload for products
- ✅ Image verification and approval
- ✅ Image deletion with cleanup
- ✅ Image metadata management
- ✅ Storage bucket management

#### Notifications
- ✅ Order notifications (new orders, status changes)
- ✅ Payment verification requests
- ✅ Low stock alerts
- ✅ System notifications
- ✅ Notification management (mark as read, delete)

---

### 🚴 Delivery Staff (Rider) Features (20+ Features)

#### Rider Dashboard
- ✅ Welcome header with rider profile
- ✅ Real-time statistics:
  - Delivered orders today
  - Active orders count
  - Available orders count
  - Total earnings
- ✅ Availability toggle (online/offline)
- ✅ Quick action buttons:
  - Manage Orders
  - View Earnings
- ✅ Available orders preview (ready for assignment)
- ✅ My orders preview (assigned orders)
- ✅ Recent orders preview (last 7 days)

#### Order Management
- ✅ View available orders (ready for pickup, not assigned)
- ✅ Accept order assignment functionality
- ✅ Order details view:
  - Customer information
  - Delivery address (for delivery orders)
  - Pickup location (for pickup orders)
  - Order items with customization
  - Payment method
  - Order status
- ✅ Real-time order updates via subscriptions
- ✅ Mark order as picked up (when ready_for_pickup)
- ✅ Update order status to "Out for Delivery"
- ✅ Track delivery progress
- ✅ Delivery confirmation workflow

#### Payment Verification (COD)
- ✅ Verify Cash on Delivery payments
- ✅ Payment amount confirmation
- ✅ Payment status update (verified/failed)
- ✅ Payment transaction creation
- ✅ Customer notification on verification

#### Delivery Completion
- ✅ Mark order as delivered functionality
- ✅ Upload proof of delivery:
  - Camera integration for photo capture
  - Gallery integration for image selection
  - Image compression and optimization
- ✅ Delivery proof storage in database
- ✅ Delivery timestamp tracking
- ✅ Customer notification on delivery

#### Earnings Management
- ✅ Total earnings (all time)
- ✅ Time-based earnings:
  - Today's earnings
  - This week earnings
  - Last week earnings
  - This month earnings
  - Last month earnings
- ✅ Fixed delivery fee (₱50 per delivery)
- ✅ Average earning per delivery calculation
- ✅ Weekly breakdown chart (7 days)
- ✅ Recent deliveries list with earnings
- ✅ Statistics cards:
  - Total deliveries
  - Completed deliveries
  - Average per delivery
- ✅ Earnings history with filtering

#### Order History
- ✅ Assigned orders list (active deliveries)
- ✅ Available orders list (ready for assignment)
- ✅ Recent orders (last 7 days)
- ✅ Delivered orders history
- ✅ Order status filtering
- ✅ Order search functionality

#### Profile Management
- ✅ Profile information display
- ✅ Profile editing functionality
- ✅ Avatar upload with compression
- ✅ Settings management
- ✅ Availability status management

#### Notifications
- ✅ New order assignment notifications
- ✅ Order status change notifications
- ✅ Payment verification requests
- ✅ System notifications
- ✅ Notification management (mark as read, delete)

#### Help & Support
- ✅ Help & Support page
- ✅ Delivery-specific FAQs
- ✅ Support contact options
- ✅ Terms & Privacy page

---

## 🛠 Tech Stack

### Core Technologies
- **React Native**: `0.81.4` - Cross-platform mobile framework
- **React**: `19.1.0` - UI library
- **Expo**: `~54.0.10` - Development platform and tooling
- **Expo Router**: `~6.0.8` - File-based routing system
- **TypeScript**: `~5.9.2` - Type safety and development experience

### State Management & Data Fetching
- **Zustand**: `^5.0.8` - Lightweight global state management
  - Authentication state with persistence
  - Cart management with AsyncStorage
- **TanStack React Query**: `^5.89.0` - Server state management and caching
  - Real-time data synchronization
  - Optimistic updates
  - Automatic refetching

### Backend & Database
- **Supabase**: `^2.57.4` - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication with JWT tokens
  - Storage for images and files
  - Edge Functions for serverless operations

### Form Handling & Validation
- **React Hook Form**: `^7.62.0` - Performant form library
- **Zod**: `^3.25.76` - Schema validation

### Image Handling
- **Expo Image**: `^3.0.10` - Optimized image component
- **Expo Image Picker**: `~17.0.8` - Camera and gallery access
- **Expo Image Manipulator**: `^14.0.7` - Image compression and format conversion
- **Expo File System**: `~19.0.16` - File handling operations

### Additional Libraries
- **QRCode**: `^1.5.4` - QR code generation for payments
- **React Native Paper**: `^5.14.5` - Material Design components
- **React Native Reanimated**: `~4.1.1` - Smooth animations
- **React Native Gesture Handler**: `~2.28.0` - Touch gesture system
- **Expo Location**: `~19.0.7` - Location services
- **Expo Notifications**: `~0.32.12` - Push notifications (planned)

---

## 🏗 Architecture & Logic

### State Management Pattern

#### Global State (Zustand)
- **Authentication**: Session, user profile, roles
- **Cart**: Shopping cart items with persistence
- **Theme**: App theme preferences

#### Server State (React Query)
- **Products**: Product data with caching and real-time updates
- **Orders**: Order management with optimistic updates
- **User Data**: Profile, addresses, saved products
- **Admin Data**: Dashboard stats, reports, analytics

### Service Layer Pattern
All business logic is separated into service modules:
- **Separation of Concerns**: UI components only handle presentation
- **Reusability**: Services can be used across multiple components
- **Testability**: Services can be easily unit tested
- **Type Safety**: Full TypeScript integration

### Real-time Updates
- **Supabase Realtime**: Live subscriptions for orders, products, assignments
- **Automatic Refresh**: React Query handles automatic data refetching
- **Optimistic Updates**: Immediate UI updates with server sync
- **Refresh Coordination**: Prevents excessive API calls with debouncing (300ms)

### Authentication Flow
1. User signs in → Supabase Auth
2. Session stored → AsyncStorage + Zustand
3. Profile loaded → Database query
4. Role determined → Route protection
5. Session refreshed → Automatic token refresh every 5 minutes
6. Session restored → On app restart from storage

### Order Flow (Complete Lifecycle)

#### For Delivery Orders:
1. **Customer**: Places order with customization and delivery address
2. **System**: Creates order with status `pending`
3. **Admin**: Receives order notification
4. **Admin**: Processes order (status → `preparing`)
5. **Admin**: Verifies payment (if GCash) or marks ready
6. **Admin**: Marks order as `ready_for_pickup`
7. **System**: Auto-assigns to available rider (or manual assignment)
8. **Rider**: Accepts and picks up order
9. **Rider**: Updates status to `out_for_delivery`
10. **Rider**: Delivers order and verifies payment (if COD)
11. **Rider**: Uploads proof of delivery
12. **System**: Updates order status to `delivered`
13. **Customer**: Receives real-time updates throughout

#### For Pickup Orders:
1. **Customer**: Places order with pickup option
2. **System**: Creates order with status `pending`
3. **Admin**: Receives order notification
4. **Admin**: Processes order (status → `preparing`)
5. **Admin**: Verifies payment (if GCash)
6. **Admin**: Marks order as `ready_for_pickup`
7. **Customer**: Receives notification to pick up
8. **Customer**: Picks up order
9. **Admin/Customer**: Marks as picked up
10. **System**: Updates order status to `delivered`

### Rider Assignment Logic

#### Automatic Assignment Algorithm
When an order becomes `ready_for_pickup`, the system automatically assigns it to the best available rider using a scoring algorithm:

**Scoring Factors:**
- **Distance Score (40%)**: Closer riders get higher scores
- **Availability Score (30%)**: Less busy riders get higher scores
- **Urgency Score (30%)**: Newer orders get higher scores

**Assignment Rules:**
- Max 3 active orders per rider
- Rider must be available (`is_available = true`)
- GCash orders must have payment verified
- COD orders can be assigned before payment verification

**Code Location**: `services/auto-assignment.service.ts`

#### Manual Assignment
- Admin can manually assign orders to specific riders
- Riders can self-assign from available orders
- Reassignment capability for orders

**Code Location**: `services/admin-assignment.service.ts`, `services/rider.service.ts`

### Payment Processing Logic

#### GCash Payment Flow:
1. Customer selects GCash payment method
2. System generates QR code with expiration timer
3. Customer uploads payment proof (camera/gallery)
4. Image is compressed and uploaded to Supabase Storage
5. Admin reviews payment proof
6. Admin verifies or rejects payment
7. Customer receives notification of verification status
8. Order proceeds if verified

#### COD Payment Flow:
1. Customer selects COD payment method
2. Order is placed and can be assigned to rider
3. Rider picks up order
4. Rider delivers order to customer
5. Rider verifies payment amount
6. Rider marks payment as verified
7. System creates payment transaction record

**Code Location**: `services/qr-code.service.ts`, `services/order.service.ts`

### Inventory Management Logic

#### Stock Tracking:
- **Automatic Decrement**: Stock decreases when order is created
- **Availability Sync**: Product becomes unavailable when stock reaches zero
- **Low Stock Alerts**: Admin receives notifications when stock is below threshold
- **Stock Updates**: Admin can manually update stock levels

**Code Location**: `services/product.service.ts`, Database triggers

### Notification System Logic

#### Smart Deduplication:
- **Category Normalization**: Groups similar notifications
- **Order-based Deduplication**: Prevents duplicate order notifications
- **Concise Title Mapping**: Shortens notification titles
- **Message Shortening**: Optimizes notification messages
- **Idempotency**: Prevents duplicates within 5-minute window

#### Notification Triggers:
- Order status changes
- Payment status updates
- Delivery assignments
- Rider availability changes
- Low stock alerts (for admins)

**Code Location**: `services/notification-triggers.service.ts`, `contexts/NotificationContext.tsx`

### AI Recommendation Logic

#### Featured Products Algorithm:
1. Analyzes order history
2. Calculates product popularity based on order frequency
3. Returns top products using SQL function `get_featured_products(limit)`
4. Falls back to available products if no order history

#### Personalized Recommendations:
1. Uses Fisher-Yates shuffle for variety
2. Considers user's order history
3. Provides category-based recommendations
4. Smart fallbacks when user history is limited

**Code Location**: `services/recommendation.service.ts`, `hooks/useRecommendations.ts`

---

## 🗄 Database Schema

### Core Tables

#### User Management
- **`profiles`** - User profiles with role-based access
  - `id`, `username`, `full_name`, `phone_number`, `role`, `avatar_url`
  - `email_verified`, `phone_verified`, `is_blocked`
  - `created_at`, `updated_at`, `last_login`
- **`addresses`** - Customer delivery addresses
  - `id`, `user_id`, `label`, `full_address`, `is_default`
- **`saved_products`** - Customer favorite products
  - `id`, `user_id`, `product_id`, `created_at`

#### Product Management
- **`categories`** - Product categories
  - `id`, `name`, `description`, `created_at`
- **`products`** - Menu items with pricing, availability, images
  - `id`, `name`, `description`, `category_id`, `base_price`
  - `image_url`, `gallery_image_urls`, `is_available`
  - `preparation_time_minutes`, `allergens`, `nutritional_info`
- **`product_stock`** - Inventory management with stock tracking
  - `id`, `product_id`, `quantity`, `last_updated_at`
- **`pizza_options`** - Size and crust combinations
  - `id`, `product_id`, `size`, `price`, `crust_id`
- **`crusts`** - Available crust types
  - `id`, `name`
- **`toppings`** - Available toppings
  - `id`, `name`, `price`
- **`pizza_topping_options`** - Topping availability per pizza option
  - `id`, `pizza_option_id`, `topping_id`

#### Order Management
- **`orders`** - Customer orders with status tracking and payment information
  - `id`, `user_id`, `delivery_address_id`, `total_amount`
  - `status`, `fulfillment_type`, `payment_method`, `payment_status`
  - `order_notes`, `customer_notes`, `admin_notes`
  - `proof_of_payment_url`, `estimated_delivery_time`, `actual_delivery_time`
  - `pickup_ready_at`, `picked_up_at`, `pickup_verified_at`
  - `pickup_location_snapshot`, `pickup_notes`
  - `created_at`, `updated_at`
- **`order_items`** - Individual items within orders with customization
  - `id`, `order_id`, `product_id`, `pizza_option_id`, `quantity`
  - `unit_price`, `customization_details`, `selected_size`
- **`delivery_assignments`** - Rider-order assignments with status tracking
  - `id`, `order_id`, `rider_id`, `status`
  - `assigned_at`, `picked_up_at`, `delivered_at`, `notes`

#### Payment & Transactions
- **`payment_transactions`** - Payment records with verification status
  - `id`, `order_id`, `payment_method`, `amount`, `status`
  - `proof_url`, `verified_at`, `verified_by`, `notes`

#### Delivery Management
- **`riders`** - Rider profiles with availability and statistics
  - `id`, `user_id`, `is_available`, `total_deliveries`
  - `total_earnings`, `created_at`, `updated_at`

#### System Tables
- **`notifications`** - User notifications for real-time updates
  - `id`, `user_id`, `type`, `title`, `message`, `data`
  - `is_read`, `created_at`
- **`image_metadata`** - Image upload metadata and references
  - `id`, `user_id`, `bucket_name`, `file_path`, `file_size`
  - `mime_type`, `created_at`

### Database Functions

#### SQL Functions
- **`get_featured_products(limit)`** - Returns top products based on order history
- **`calculate_rider_stats(rider_id)`** - Calculates rider statistics
- **`auto_assign_order(order_id)`** - Automatic order assignment function

### Database Enums

#### Status Enums
- **`order_status`**: `pending`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `delivered`, `cancelled`
- **`payment_status`**: `pending`, `verified`, `failed`, `refunded`
- **`payment_method`**: `cod`, `gcash`
- **`user_role`**: `customer`, `admin`, `delivery`
- **`fulfillment_type`**: `delivery`, `pickup`
- **`delivery_status`**: `Assigned`, `Picked Up`, `In Transit`, `Delivered`, `Failed`

### Storage Buckets

#### File Storage
- **`avatars`** - User profile pictures (public)
- **`product-images`** - Product images (public)
- **`payment-proofs`** - Payment verification images (private)
- **`delivery-proofs`** - Delivery confirmation images (private)
- **`thumbnails`** - Image thumbnails (if implemented)

### Database Triggers

#### Automated Triggers
- **Stock decrement** on order creation
- **Product availability sync** with stock levels
- **Low stock alerts** for admins
- **Notification triggers** on order status changes
- **Payment status update** triggers

### Row Level Security (RLS)

#### Security Policies
- **User-specific data** access (users can only see their own data)
- **Role-based access** (admin, customer, delivery)
- **Storage bucket policies** (public/private access)
- **Data isolation** between users

---

## 🔧 Services & Business Logic

### Service Modules (20+ Services)

#### Core Services
- **`auth.service.ts`** - Authentication and user management
- **`session.service.ts`** - Session persistence and token refresh
- **`user.service.ts`** - User profile management and blocklist
- **`order.service.ts`** - Order creation, updates, and tracking
- **`product.service.ts`** - Product management and inventory
- **`product-detail.service.ts`** - Product detail information

#### Payment Services
- **`qr-code.service.ts`** - QR code generation for payments
- **`payment.service.ts`** - Payment processing and verification

#### Delivery Services
- **`rider.service.ts`** - Rider operations and order management
- **`auto-assignment.service.ts`** - Automatic order-to-rider assignment
- **`admin-assignment.service.ts`** - Manual order assignment by admin

#### Recommendation Services
- **`recommendation.service.ts`** - AI-powered product recommendations

#### Image Services
- **`image-upload.service.ts`** - Image upload, compression, and storage

#### Notification Services
- **`notification-triggers.service.ts`** - Notification creation and management
- **`api.ts`** - API utilities and helpers

#### Admin Services
- **`admin.service.ts`** - Admin operations and dashboard
- **`reports.service.ts`** - Reports and analytics

#### Utility Services
- **`alert.service.ts`** - Alert and dialog management
- **`debug.service.ts`** - Debug utilities (development only)
- **`debug-data.service.ts`** - Debug data utilities

### Service Architecture

Each service follows a consistent pattern:
- **Type Safety**: Full TypeScript integration
- **Error Handling**: Consistent error handling across all services
- **Real-time Support**: Integration with Supabase Realtime
- **Validation**: Input validation and sanitization
- **Logging**: Error logging and debugging support

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17.0 (LTS) or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Expo CLI**: Latest version (`npm install -g expo-cli`)
- **Supabase Account**: [Sign up here](https://supabase.com/)
- **Git**: For version control
- **Watchman** (macOS/Linux): For file watching
- **Android Studio** (Android) / **Xcode** (iOS): For mobile development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd capstone-project2
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install

   # Install Expo dependencies
   npx expo install
   
   # Install TypeScript types (if needed)
   npm install --save-dev @types/react @types/react-native @types/node
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: Environment
   EXPO_PUBLIC_ENV=development
   
   # Optional: Deep Linking
   EXPO_PUBLIC_APP_SCHEME=capstoneproject2
   ```

4. **Set up Supabase**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run database migrations (see `supabase/migrations/` directory)
   - Set up storage buckets:
     - `avatars` - For user profile pictures
     - `product-images` - For product images
     - `payment-proofs` - For payment verification images
     - `delivery-proofs` - For delivery confirmation images
   - Configure Row Level Security (RLS) policies
   - Set up authentication providers
   - Configure email templates (if using email verification)

5. **Configure Supabase Redirect URLs**
   
   In Supabase Dashboard > Authentication > URL Configuration:
   - `capstoneproject2://auth/callback` (mobile app)
   - `http://localhost:8081/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production web)

6. **Start the development server**
   ```bash
   npm start
   ```

   Then:
   - Press `a` for Android
   - Press `i` for iOS simulator
   - Press `w` for web
   - Scan QR code with Expo Go app on your device

---

## 📱 Project Structure

```
capstone-project2/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                  # Authentication screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (customer)/             # Customer-facing screens
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── index.tsx      # Home with AI recommendations
│   │   │   ├── menu.tsx       # Menu browsing
│   │   │   ├── cart.tsx       # Shopping cart
│   │   │   ├── orders.tsx     # Order history
│   │   │   ├── saved.tsx      # Saved products
│   │   │   └── profile.tsx    # User profile
│   │   ├── checkout.tsx        # Checkout process
│   │   ├── menu/               # Menu screens
│   │   │   ├── index.tsx
│   │   │   └── [category].tsx
│   │   ├── product/            # Product screens
│   │   │   └── [id].tsx        # Product detail
│   │   ├── orders/             # Order screens
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── notification.tsx    # Notifications
│   │   └── profile/            # Profile screens
│   │       ├── addresses.tsx
│   │       ├── address-form.tsx
│   │       ├── payment-methods.tsx
│   │       ├── settings.tsx
│   │       └── help-support.tsx
│   ├── (admin)/                # Admin dashboard screens
│   │   ├── dashboard/         # Dashboard
│   │   │   ├── index.tsx
│   │   │   └── index.debug.tsx
│   │   ├── products/           # Product management
│   │   │   ├── index.tsx
│   │   │   ├── new.tsx
│   │   │   └── [id].tsx
│   │   ├── orders/             # Order management
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── users/              # User management
│   │   │   └── index.tsx
│   │   ├── menu/               # Menu management
│   │   │   └── index.tsx
│   │   ├── reports/            # Reports & analytics
│   │   │   └── index.tsx
│   │   ├── images/             # Image management
│   │   │   └── index.tsx
│   │   ├── notifications/      # Notifications
│   │   │   └── index.tsx
│   │   └── profile/            # Admin profile
│   │       ├── index.tsx
│   │       └── settings.tsx
│   ├── (delivery)/             # Delivery staff screens
│   │   ├── dashboard/         # Rider dashboard
│   │   │   └── index.tsx
│   │   ├── orders/             # Order management
│   │   │   ├── index.tsx
│   │   │   └── earnings.tsx
│   │   ├── order/              # Order detail
│   │   │   └── [id].tsx
│   │   ├── notifications/      # Notifications
│   │   │   └── index.tsx
│   │   ├── profile/            # Rider profile
│   │   │   ├── index.tsx
│   │   │   └── settings.tsx
│   │   ├── help-support.tsx    # Help & support
│   │   ├── terms-privacy.tsx  # Terms & privacy
│   │   └── settings.tsx        # Settings
│   ├── _layout.tsx            # Root layout with session management
│   ├── +html.tsx              # HTML template
│   ├── +not-found.tsx         # 404 page
│   └── modal.tsx              # Modal component
│
├── components/                 # Reusable UI components
│   ├── admin/                 # Admin-specific components
│   ├── auth/                  # Authentication components
│   ├── payment/               # Payment components
│   │   ├── QRCodePayment.tsx
│   │   └── PaymentProofUpload.tsx
│   ├── rider/                 # Rider/delivery components
│   │   ├── RiderDashboard.tsx
│   │   └── RiderOrdersManager.tsx
│   ├── ui/                    # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── OrderCard.tsx
│   │   ├── GCashPaymentModal.tsx
│   │   ├── PaymentProcessingOverlay.tsx
│   │   └── ImageUploadProcessingOverlay.tsx
│   └── Themed.tsx            # Theme-aware component wrapper
│
├── constants/                  # App-wide constants
│   ├── Colors.ts             # Color palette
│   ├── Layout.ts             # Layout constants
│   ├── Responsive.ts         # Responsive breakpoints
│   ├── Strings.ts            # String constants
│   └── Styles.ts             # Global styles
│
├── contexts/                   # React contexts
│   ├── AuthContext.tsx       # Legacy auth context (deprecated)
│   ├── NotificationContext.tsx
│   ├── SavedProductsContext.tsx
│   ├── RefreshCoordinatorContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                      # Custom React hooks
│   ├── admin/                # Admin hooks
│   │   └── queryKeys.ts
│   ├── useAuth.ts            # Authentication hook
│   ├── useAuthActions.ts     # Auth actions
│   ├── useCart.ts            # Shopping cart management
│   ├── useOrders.ts          # Order management
│   ├── useProducts.ts        # Product fetching
│   ├── useRecommendations.ts # AI recommendations
│   ├── useRiderProfile.ts    # Rider profile management
│   ├── useImageUpload.ts     # Image upload handling
│   ├── useAvatar.ts          # Avatar management
│   ├── useAddresses.ts       # Address management
│   ├── useSavedProducts.ts   # Saved products
│   ├── useNotifications.ts   # Notifications
│   ├── useAdminOrders.ts     # Admin order management
│   ├── useAdminProducts.ts   # Admin product management
│   ├── useAdminStats.ts      # Admin statistics
│   ├── useDeliveryOrders.ts  # Delivery order management
│   ├── useRevenueAnalytics.ts # Revenue analytics
│   ├── useTopProducts.ts     # Top products
│   ├── useSlices.ts          # Pizza slices
│   ├── useFormValidation.ts  # Form validation
│   ├── useResponsive.ts      # Responsive utilities
│   ├── useGestureNavigation.ts # Gesture navigation
│   ├── useDebugData.ts       # Debug data
│   ├── useProductDetail.ts   # Product detail
│   ├── useProfile.ts         # User profile
│   └── index.ts              # Hook exports
│
├── services/                   # Business logic layer
│   ├── auth.service.ts       # Authentication
│   ├── session.service.ts    # Session management
│   ├── user.service.ts       # User management
│   ├── order.service.ts      # Order management
│   ├── product.service.ts    # Product management
│   ├── product-detail.service.ts # Product details
│   ├── rider.service.ts      # Rider operations
│   ├── auto-assignment.service.ts # Auto assignment
│   ├── admin-assignment.service.ts # Admin assignment
│   ├── recommendation.service.ts # AI recommendations
│   ├── qr-code.service.ts    # QR code generation
│   ├── image-upload.service.ts # Image uploads
│   ├── notification-triggers.service.ts # Notifications
│   ├── admin.service.ts      # Admin operations
│   ├── reports.service.ts    # Reports & analytics
│   ├── alert.service.ts      # Alert management
│   ├── api.ts                # API utilities
│   ├── debug.service.ts      # Debug utilities
│   └── debug-data.service.ts # Debug data
│
├── lib/                        # Core utilities
│   ├── supabase.ts           # Supabase client configuration
│   ├── supabase-client.ts    # Client-side Supabase setup
│   ├── database.types.ts      # Database type definitions
│   └── supabase.types.ts     # Generated Supabase types
│
├── types/                      # TypeScript type definitions
│   ├── product.types.ts
│   ├── order.types.ts
│   └── user.types.ts
│
├── utils/                      # Utility functions
│   ├── sessionPersistence.ts  # Session storage utilities
│   ├── notificationGrouping.ts # Notification grouping
│   ├── sliceSorting.ts        # Pizza slice sorting
│   └── sizeSorting.ts         # Size sorting
│
├── database/                   # Database setup scripts
│   ├── migrations/           # SQL migration files
│   ├── setup_avatars_bucket.sql
│   ├── setup_product_images_bucket.sql
│   ├── product_stock_triggers.sql
│   └── ...                    # Additional setup scripts
│
├── supabase/                   # Supabase configuration
│   ├── functions/            # Edge Functions
│   │   └── recommendations/  # AI recommendation function
│   └── migrations/           # Database migrations
│       ├── 20241113_add_order_fulfillment_type.sql
│       ├── 20241201_add_user_blocklist.sql
│       └── ...
│
├── assets/                     # Static assets
│   ├── fonts/                # Custom fonts
│   ├── images/               # Images and icons
│   └── gcash_qr.jpg          # Payment QR code template
│
├── styles/                     # Global styles
│   ├── admin.ts              # Admin-specific styles
│   └── global.ts             # Global styles
│
├── app.json                    # Expo configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

---

## 🛠 Development Guide

### Development Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

### Code Organization

- **Components**: Reusable UI components in `components/`
- **Screens**: Page components in `app/` using Expo Router
- **Hooks**: Custom hooks in `hooks/` for data fetching and state
- **Services**: Business logic in `services/`
- **Types**: TypeScript definitions in `types/`
- **Utils**: Helper functions in `utils/`

### TypeScript

The project uses strict TypeScript configuration:
- All files are typed
- Database types generated from Supabase
- Full type safety across the application

### Testing

Currently, the project includes:
- Component tests in `components/__tests__/`
- Manual testing workflows
- Future: Unit tests for services and hooks

---

## ✨ Recent Updates & Upgrades

### v2.1.0 - Latest Updates (2024)

#### 🆕 Order Fulfillment System
- ✅ **Pickup and Delivery Options**: Complete dual fulfillment system
- ✅ **Pickup Location Tracking**: Pickup location snapshot and notes
- ✅ **Pickup Verification**: Pickup ready, picked up, and verification timestamps
- ✅ **Fulfillment Type Badges**: Visual indicators for delivery/pickup orders

#### 🚫 User Blocklist System
- ✅ **Block/Unblock Users**: Instead of deleting users, block them
- ✅ **Enhanced User Management**: Better user filtering and search
- ✅ **User Statistics**: Active/inactive based on block status
- ✅ **Blocked User Indicators**: Visual indicators for blocked users

#### 📦 Product Stock Automation
- ✅ **Automatic Stock Decrement**: Stock decreases when order is created
- ✅ **Availability Sync**: Product becomes unavailable when stock reaches zero
- ✅ **Low Stock Alerts**: Admin receives notifications when stock is below threshold
- ✅ **Stock Management**: Enhanced stock tracking and updates

#### 🔔 Enhanced Notification System
- ✅ **Time-based Grouping**: Notifications grouped by time (Today, This Week, This Month, Older)
- ✅ **Better Organization**: Improved notification display and filtering
- ✅ **Unlimited Notifications**: Fetch all notifications without limit
- ✅ **Smart Sorting**: Newest first (LIFO) sorting

#### 🍕 Pizza Slice Sorting
- ✅ **Consistent Ordering**: 8 Regular Cut → 16 Regular Cut → 32 Square Cut
- ✅ **Intelligent Sorting**: Size-based priority system
- ✅ **Better UX**: Logical size progression for users

#### 📞 Help & Support Pages
- ✅ **Customer Help Page**: Complete FAQ system with categories
- ✅ **Delivery Help Page**: Delivery-specific FAQs and support
- ✅ **Contact Support**: Multiple support channels (Call, FB Page, Live Chat)
- ✅ **Terms & Privacy**: Complete terms and privacy documentation

#### 🎨 UI/UX Improvements
- ✅ **Payment Processing Overlay**: Better payment feedback
- ✅ **Image Upload Overlay**: Enhanced image upload experience
- ✅ **Enhanced Order Cards**: Fulfillment type display
- ✅ **Better Loading States**: Consistent loading indicators
- ✅ **Improved Error Handling**: User-friendly error messages

### v2.0.0 - Major Feature Releases (2024)

#### 🤖 AI-Powered Recommendation System
- ✅ Featured products based on order history
- ✅ Personalized suggestions using Fisher-Yates shuffle
- ✅ Category-based recommendations with smart fallbacks
- ✅ SQL functions for performance optimization

#### 💳 Enhanced Payment System
- ✅ QR code generation with expiration timers
- ✅ Payment proof upload with camera/gallery integration
- ✅ Complete admin verification workflow
- ✅ Payment transaction records

#### 🚴 Advanced Rider Management System
- ✅ Intelligent automatic assignment algorithm
- ✅ Comprehensive rider dashboard
- ✅ COD payment verification workflow
- ✅ Proof of delivery capture system
- ✅ Real-time order updates

#### 🔐 Session Management & Persistence
- ✅ Persistent sessions with AsyncStorage
- ✅ Automatic token refresh (every 5 minutes)
- ✅ Fast session restoration on app startup
- ✅ Graceful error handling

#### 📸 Image Upload System
- ✅ Avatar upload with compression
- ✅ Product image management
- ✅ Payment proof and delivery proof handling
- ✅ Automatic image optimization

---

## 📦 Building for Production

### Android

```bash
# Build Android APK
eas build --platform android

# Build Android App Bundle (for Play Store)
eas build --platform android --profile production
```

### iOS

```bash
# Build iOS app (requires macOS and Apple Developer account)
eas build --platform ios

# Build for App Store
eas build --platform ios --profile production
```

### Environment Setup

1. Configure production environment variables
2. Set up production Supabase instance
3. Configure app store credentials
4. Update app.json with production settings
5. Build and submit to app stores

---

## ⚠️ Troubleshooting

### Common Issues & Solutions

#### TypeScript Errors
```bash
# Ensure all TypeScript dependencies are installed
npm install --save-dev typescript @types/react @types/react-native @types/node

# Check TypeScript configuration
npx tsc --noEmit
```

#### Node.js Version Issues
```bash
# Use nvm to manage Node.js versions
nvm install 18.17.0
nvm use 18.17.0
```

#### Module Resolution Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Session Not Persisting
- Check AsyncStorage permissions
- Verify Supabase configuration
- Review session service logs
- Check network connectivity

#### Image Upload Issues
- Verify Supabase Storage bucket permissions
- Check RLS policies for storage buckets
- Ensure image compression is working
- Verify file size limits

#### Real-time Updates Not Working
- Check Supabase Realtime is enabled
- Verify RLS policies allow subscriptions
- Check network connectivity
- Review subscription cleanup

### Debug Mode

The app includes debug components (development only):
- Session debug component
- Data inspection tools
- Network request monitoring

---

## 📚 Documentation

### Additional Documentation Files

- **`PROJECT_FEATURES_SCOPE.md`** - Complete feature documentation (175+ features)
- **`COMPLETE_CHANGES_LIST.md`** - Comprehensive list of all changes
- **`QUICK_CHANGES_REFERENCE.md`** - Quick reference for recent changes
- **`IMPLEMENTATION-SUMMARY.md`** - AI recommendations and payment system
- **`RIDER_IMPLEMENTATION_SUMMARY.md`** - Rider management system
- **`RIDER_ASSIGNMENT_EXPLANATION.md`** - Detailed rider assignment logic
- **`SESSION_MANAGEMENT_README.md`** - Session persistence system
- **`AVATAR_UPLOAD_SETUP_GUIDE.md`** - Avatar upload setup
- **`PRODUCT_IMAGE_UPLOAD_SETUP_GUIDE.md`** - Product images setup
- **`SIZE_SORTING_EXPLANATION.md`** - Pizza size sorting implementation
- **`TERMS_PRIVACY_HELP_SUPPORT_GUIDE.md`** - Terms & Privacy implementation
- **`hooks/README.md`** - Custom hooks documentation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the troubleshooting section
- Contact the development team

---

## 🔄 Version History

### v2.1.0 (Current) - Latest Updates
- ✅ Order fulfillment system (pickup/delivery)
- ✅ User blocklist functionality
- ✅ Product stock automation
- ✅ Enhanced notification grouping
- ✅ Pizza slice sorting
- ✅ Help & Support pages
- ✅ Terms & Privacy pages
- ✅ Processing overlays

### v2.0.0 - Major Feature Release
- ✅ AI-powered recommendation system
- ✅ Enhanced payment verification with QR codes
- ✅ Advanced rider management with auto-assignment
- ✅ Session persistence and management
- ✅ Image upload system (avatars, products, proofs)
- ✅ Comprehensive service layer (20+ services)
- ✅ Real-time updates throughout the app
- ✅ Enhanced UI/UX with responsive design

### v1.0.0 - Initial Release
- ✅ Customer ordering and tracking
- ✅ Admin dashboard and management
- ✅ Delivery staff functionality
- ✅ Basic payment system
- ✅ Product and inventory management

---

## 🎯 Roadmap

### Planned Features
- [ ] Push notifications (Expo Notifications)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Offline functionality with sync
- [ ] Enhanced AI recommendations with machine learning
- [ ] Integration with more payment gateways
- [ ] Customer reviews and ratings system
- [ ] GPS tracking for deliveries
- [ ] Route optimization for riders
- [ ] Advanced reporting and analytics

### Future Enhancements
- [ ] Multi-restaurant support
- [ ] Loyalty program integration
- [ ] Social sharing features
- [ ] Advanced search with filters
- [ ] Order scheduling
- [ ] Subscription management

---

## 📊 Project Statistics

### Feature Count
- **Total Features**: 175+ individual features
- **Customer Features**: 40+ features
- **Admin Features**: 35+ features
- **Delivery Staff Features**: 20+ features
- **Core System Features**: 15+ features
- **Technical Features**: 10+ features

### Code Statistics
- **Service Modules**: 20+ services
- **Custom Hooks**: 25+ hooks
- **UI Components**: 50+ components
- **Database Tables**: 15+ tables
- **Database Functions**: 3+ SQL functions
- **Storage Buckets**: 4+ buckets

### Implementation Status
- ✅ **Fully Implemented**: 95% of core features
- ⚠️ **Partially Implemented**: 5% (GPS tracking, push notifications)
- ❌ **Not Implemented**: Future enhancements (reviews, loyalty program)

---

**Kitchen One App** - Digitizing restaurant operations for better efficiency and customer satisfaction. 🍕✨

*Built with ❤️ using React Native, Expo, and Supabase*

---

**Last Updated**: Novemember 11, 2025 
**Project Version**: 2.1.0  
**Status**: Production Ready ✅
