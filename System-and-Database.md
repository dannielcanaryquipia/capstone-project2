# Pizza Delivery Management System - Technical Manual

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
   - [Core Tables](#core-tables)
   - [Schema Relationships](#schema-relationships)
3. [Technical Stack](#technical-stack)
4. [API Documentation](#api-documentation)
5. [Authentication & Authorization](#authentication--authorization)
6. [Deployment Guide](#deployment-guide)
7. [Maintenance Procedures](#maintenance-procedures)
8. [Troubleshooting](#troubleshooting)
9. [Appendix](#appendix)

## System Overview

The Pizza Delivery Management System is a comprehensive solution designed to handle all aspects of a pizza delivery business, from order processing to delivery management. The system provides:

- **Order Management**: Complete order lifecycle from creation to fulfillment
- **Inventory Control**: Real-time tracking of ingredients and products
- **Delivery Coordination**: Rider assignment and tracking
- **Payment Processing**: Secure payment handling with multiple methods
- **User Management**: Customer and staff accounts with role-based access
- **Analytics**: Business intelligence and reporting

## Database Schema

### Core Tables

#### 1. User Management
- **profiles**: User accounts with authentication details
- **user_preferences**: Custom user settings and preferences
- **addresses**: Delivery addresses and location data
- **saved_products**: User's favorite products

#### 2. Product Catalog
- **products**: Main product information
- **categories**: Product classification
- **toppings**: Available pizza toppings
- **crusts**: Pizza base options
- **slices**: Pre-configured slice options
- **pizza_options**: Configurable pizza combinations

#### 3. Order Processing
- **orders**: Core order information
- **order_items**: Individual products in orders
- **order_item_toppings**: Custom toppings for order items
- **order_notes**: Additional order instructions
- **order_status_history**: Audit trail of order changes

#### 4. Payment System
- **payment_transactions**: Payment records
- **image_metadata**: Storage for payment/delivery proofs

#### 5. Delivery Management
- **delivery_assignments**: Rider assignments
- **riders**: Delivery personnel information

### Schema Relationships

```mermaid
erDiagram
    profiles ||--o{ addresses : has
    profiles ||--o{ orders : places
    orders ||--o{ order_items : contains
    order_items }|--|| products : references
    order_items }|--o{ order_item_toppings : has
    order_item_toppings }|--|| toppings : references
    products }|--|| categories : belongs_to
    pizza_options }|--|| crusts : uses
    pizza_options }|--o{ pizza_topping_options : has
    pizza_topping_options }|--|| toppings : references
    orders ||--o{ payment_transactions : has
    orders ||--o{ delivery_assignments : has
    delivery_assignments }|--|| riders : assigned_to
```

## Technical Stack

### Backend
- **Runtime**: Node.js 16+
- **Database**: PostgreSQL 13+ with Supabase
- **API**: RESTful architecture
- **Authentication**: JWT with refresh tokens
- **File Storage**: Supabase Storage

### Frontend
- **Framework**: React Native with Expo
- **State Management**: React Context API
- **UI Components**: Custom components with responsive design
- **Navigation**: React Navigation

## API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate tokens

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Orders
- `POST /orders` - Create new order
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status
- `POST /orders/:id/cancel` - Cancel order

### Payments
- `POST /payments/initiate` - Start payment process
- `POST /payments/verify` - Verify payment
- `POST /payments/webhook` - Payment webhook handler

### Delivery
- `GET /delivery/available-riders` - List available riders
- `POST /delivery/assign` - Assign rider to order
- `PUT /delivery/:id/status` - Update delivery status
- `POST /delivery/:id/proof` - Upload delivery proof

## Authentication & Authorization

### User Roles
1. **Customer**: Can place and track orders
2. **Rider**: Can manage assigned deliveries
3. **Admin**: Full system access

### Security Measures
- JWT with 15-minute expiration
- Refresh tokens with 7-day expiration
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- CORS policy enforcement

## Deployment Guide

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Supabase project
- Cloud storage bucket

### Environment Variables
Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pizza_delivery

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Storage
STORAGE_BUCKET=your-bucket-name
STORAGE_URL=your-storage-url

# App
NODE_ENV=production
PORT=3000
```

### Deployment Steps

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Maintenance Procedures

### Database Backups
```bash
# Create backup
pg_dump -U username -d pizza_delivery > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U username -d pizza_delivery < backup_file.sql
```

### Monitoring
- **Logs**: Check application logs for errors
- **Performance**: Monitor database query performance
- **Uptime**: Set up monitoring for API endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify database credentials
   - Check if database server is running
   - Ensure network connectivity

2. **Authentication Problems**
   - Check token expiration
   - Verify user role permissions
   - Look for account lockouts

3. **File Upload Failures**
   - Check storage bucket permissions
   - Verify file size limits
   - Check available storage space

## Appendix

### Database Schema SQL

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- User Management
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text,
  full_address text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Product Catalog
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.crusts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT crusts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.toppings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  CONSTRAINT toppings_pkey PRIMARY KEY (id)
);

-- Order Processing
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delivery_address_id uuid,
  total_amount numeric NOT NULL,
  payment_method text,
  order_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  proof_of_payment_url text,
  estimated_delivery_time timestamp with time zone,
  actual_delivery_time timestamp with time zone,
  customer_notes text,
  admin_notes text,
  payment_verified boolean DEFAULT false,
  payment_verified_at timestamp with time zone,
  payment_verified_by uuid,
  proof_of_delivery_url text,
  order_number character varying NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::order_status,
  payment_status USER-DEFINED DEFAULT 'pending'::payment_status,
  fulfillment_type USER-DEFINED NOT NULL DEFAULT 'delivery'::order_fulfillment_type,
  pickup_ready_at timestamp with time zone,
  picked_up_at timestamp with time zone,
  pickup_verified_at timestamp with time zone,
  pickup_verified_by uuid,
  pickup_location_snapshot text,
  pickup_notes text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_pickup_verified_by_fkey FOREIGN KEY (pickup_verified_by) REFERENCES public.profiles(id),
  CONSTRAINT orders_delivery_address_id_fkey FOREIGN KEY (delivery_address_id) REFERENCES public.addresses(id),
  CONSTRAINT orders_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_payment_verified_by_fkey FOREIGN KEY (payment_verified_by) REFERENCES public.profiles(id)
);

-- Products
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid,
  base_price numeric NOT NULL CHECK (base_price >= 0::numeric),
  image_url text,
  gallery_image_urls ARRAY,
  is_available boolean DEFAULT true,
  is_recommended boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  preparation_time_minutes integer DEFAULT 30,
  is_featured boolean DEFAULT false,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- Pizza Options
CREATE TABLE public.pizza_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  size text NOT NULL,
  price numeric NOT NULL,
  crust_id uuid NOT NULL,
  CONSTRAINT pizza_options_pkey PRIMARY KEY (id),
  CONSTRAINT pizza_options_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT fk_pizza_options_crust_id FOREIGN KEY (crust_id) REFERENCES public.crusts(id)
);

-- Pizza Topping Options
CREATE TABLE public.pizza_topping_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pizza_option_id uuid,
  topping_id uuid,
  CONSTRAINT pizza_topping_options_pkey PRIMARY KEY (id),
  CONSTRAINT pizza_topping_options_topping_id_fkey FOREIGN KEY (topping_id) REFERENCES public.toppings(id),
  CONSTRAINT pizza_topping_options_pizza_option_id_fkey FOREIGN KEY (pizza_option_id) REFERENCES public.pizza_options(id)
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  pizza_option_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  customization_details jsonb,
  selected_size text,
  created_at timestamp with time zone DEFAULT now(),
  slice_id uuid,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT order_items_slice_id_fkey FOREIGN KEY (slice_id) REFERENCES public.slices(id)
);

-- Order Item Toppings
CREATE TABLE public.order_item_toppings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL,
  topping_id uuid NOT NULL,
  CONSTRAINT order_item_toppings_pkey PRIMARY KEY (id),
  CONSTRAINT order_item_toppings_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id),
  CONSTRAINT order_item_toppings_topping_id_fkey FOREIGN KEY (topping_id) REFERENCES public.toppings(id)
);

-- Order Status History
CREATE TABLE public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  status text NOT NULL,
  changed_by uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id)
);

-- Order Notes
CREATE TABLE public.order_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  note text NOT NULL,
  added_by uuid NOT NULL,
  note_type text DEFAULT 'general'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_notes_pkey PRIMARY KEY (id),
  CONSTRAINT order_notes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_notes_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id)
);

-- Payment Transactions
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  transaction_reference text,
  proof_of_payment_url text,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  qr_code_url text,
  qr_code_data text,
  qr_code_expires_at timestamp with time zone,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::payment_status,
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT payment_transactions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id)
);

-- Product Stock
CREATE TABLE public.product_stock (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  last_updated_at timestamp with time zone DEFAULT now(),
  low_stock_threshold integer DEFAULT 10,
  CONSTRAINT product_stock_pkey PRIMARY KEY (id),
  CONSTRAINT product_stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Inventory Transactions
CREATE TABLE public.inventory_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  transaction_type text NOT NULL,
  quantity integer NOT NULL,
  reason text,
  performed_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT inventory_transactions_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.profiles(id)
);

-- Product Co-occurrences
CREATE TABLE public.product_co_occurrences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_a_id uuid,
  product_b_id uuid,
  co_occurrence_count integer DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT product_co_occurrences_pkey PRIMARY KEY (id),
  CONSTRAINT product_co_occurrences_product_a_id_fkey FOREIGN KEY (product_a_id) REFERENCES public.products(id),
  CONSTRAINT product_co_occurrences_product_b_id_fkey FOREIGN KEY (product_b_id) REFERENCES public.products(id)
);

-- Riders
CREATE TABLE public.riders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_number text,
  is_available boolean DEFAULT true,
  current_location jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT riders_pkey PRIMARY KEY (id),
  CONSTRAINT riders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Delivery Assignments
CREATE TABLE public.delivery_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  rider_id uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  picked_up_at timestamp with time zone,
  delivered_at timestamp with time zone,
  status USER-DEFINED DEFAULT 'Assigned'::delivery_status,
  notes text,
  CONSTRAINT delivery_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT delivery_assignments_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.riders(id)
);

-- Image Metadata
CREATE TABLE public.image_metadata (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['payment_proof'::text, 'delivery_proof'::text])),
  url text NOT NULL,
  thumbnail_url text,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  verified boolean DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT image_metadata_pkey PRIMARY KEY (id),
  CONSTRAINT image_metadata_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT image_metadata_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id),
  CONSTRAINT image_metadata_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id)
);

-- User Interactions
CREATE TABLE public.user_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  interaction_type text NOT NULL CHECK (interaction_type = ANY (ARRAY['view'::text, 'click'::text, 'add_to_cart'::text, 'purchase'::text, 'favorite'::text])),
  created_at timestamp with time zone DEFAULT now(),
  session_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_interactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- User Preferences
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preference_key text NOT NULL,
  preference_value jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Saved Products
CREATE TABLE public.saved_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_products_pkey PRIMARY KEY (id),
  CONSTRAINT saved_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT saved_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Slices
CREATE TABLE public.slices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT slices_pkey PRIMARY KEY (id)
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  related_order_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

### API Response Formats

#### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

### Changelog

#### [1.0.0] - 2025-12-18
- Initial release of the Pizza Delivery Management System
- Core features implemented
- Basic documentation created

### Contact
For technical support, please contact:
- **Email**: [Your Support Email]
- **Documentation**: [Link to Documentation]
- **Issue Tracker**: [Link to Issue Tracker]
