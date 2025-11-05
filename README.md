# Kitchen One App

> **A comprehensive restaurant management application** built with React Native, Expo, and Supabase. This app digitizes the operations of Kitchen One Bulan, providing food ordering, delivery tracking, inventory management, AI-powered recommendations, and role-based access control.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Recent Updates & Upgrades](#-recent-updates--upgrades)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Architecture](#-architecture)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

## 🚀 Features

### Customer Features
- **Digital Menu**: Browse and search food items by category with real-time availability
- **AI-Powered Recommendations**: 
  - Featured products based on order history
  - Personalized suggestions using Fisher-Yates shuffle algorithm
  - Category-based recommendations with smart fallbacks
- **Advanced Order Management**: 
  - Place orders with pizza customization (size, crust, toppings)
  - Order tracking with real-time status updates
  - Save favorite products for quick reordering
- **Payment System**:
  - Multiple payment methods (Cash on Delivery, GCash)
  - QR code generation for online payments
  - Payment proof upload with camera/gallery integration
- **Address Management**: Save and manage multiple delivery addresses
- **Order History**: View past orders with detailed information and reorder functionality
- **Real-time Notifications**: Get instant updates on order status changes

### Admin Features
- **Comprehensive Dashboard**: 
  - Real-time overview of orders, sales, revenue analytics
  - Inventory management with low stock alerts
  - User and delivery staff management
- **Menu Management**: 
  - Add, edit, and manage products with image uploads
  - Category management
  - Product availability toggling
  - Pizza customization options (sizes, crusts, toppings)
- **Order Management**: 
  - Process orders with status updates
  - Automatic rider assignment system
  - Manual assignment override
  - Payment verification for GCash orders
- **Reports & Analytics**:
  - Sales reports and revenue analytics
  - Top products tracking
  - Performance metrics
- **Payment Verification**: Verify GCash payments with proof review

### Delivery Staff (Rider) Features
- **Rider Dashboard**: 
  - Real-time statistics (delivered orders, earnings, availability)
  - Availability toggle (online/offline)
  - Quick access to assigned orders
- **Order Management**:
  - View available orders for assignment
  - Accept assigned deliveries
  - Track assigned orders with real-time updates
  - Payment verification for COD orders
  - Proof of delivery capture with photo upload
- **Automatic Assignment**: Intelligent order-to-rider matching based on:
  - Distance-based scoring
  - Workload balancing
  - Rider availability
- **Delivery Tracking**: Update delivery status and confirm payments

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

## ✨ Recent Updates & Upgrades

### v2.0.0 - Major Feature Releases (2024)

#### 🤖 AI-Powered Recommendation System
- **Featured Products**: Algorithm-based product recommendations using order history
- **Personalized Suggestions**: Fisher-Yates shuffle for variety and user engagement
- **Category-Based Recommendations**: Smart product suggestions based on browsing patterns
- **SQL Functions**: Optimized database functions for performance (`get_featured_products`)
- **Implementation**: `services/recommendation.service.ts` with `hooks/useRecommendations.ts`

#### 💳 Enhanced Payment System
- **QR Code Generation**: Secure payment QR codes with expiration timers
- **Payment Proof Upload**: Camera and gallery integration for payment verification
- **Payment Components**: 
  - `components/payment/QRCodePayment.tsx` - QR code display with countdown
  - `components/payment/PaymentProofUpload.tsx` - Proof upload interface
- **Admin Verification**: Complete workflow for GCash payment verification
- **Implementation**: `services/qr-code.service.ts` with payment workflow

#### 🚴 Advanced Rider Management System
- **Automatic Assignment**: Intelligent order-to-rider matching algorithm
  - Distance-based scoring
  - Workload balancing
  - Configurable assignment rules
- **Rider Dashboard**: Comprehensive statistics and order management
- **Payment Verification**: COD verification workflow for riders
- **Proof of Delivery**: Photo capture and upload system
- **Real-time Updates**: Live order status and assignment notifications
- **Implementation**: 
  - `services/rider.service.ts`
  - `services/auto-assignment.service.ts`
  - `services/admin-assignment.service.ts`
  - `components/rider/RiderDashboard.tsx`
  - `components/rider/RiderOrdersManager.tsx`

#### 🔐 Session Management & Persistence
- **Persistent Sessions**: Session storage with AsyncStorage for app restarts
- **Automatic Token Refresh**: Background token refresh every 5 minutes
- **Session Restoration**: Fast session restoration on app startup
- **Error Handling**: Graceful handling of network errors and invalid sessions
- **Implementation**: 
  - `services/session.service.ts`
  - `utils/sessionPersistence.ts`
  - Enhanced `hooks/useAuth.ts`

#### 📸 Image Upload System
- **Avatar Upload**: Profile picture upload with compression
- **Product Images**: Product image management with Supabase Storage
- **Proof Images**: Payment proof and delivery proof image handling
- **Image Optimization**: Automatic compression and format conversion
- **Implementation**: 
  - `services/image-upload.service.ts`
  - `hooks/useImageUpload.ts`
  - `hooks/useAvatar.ts`

#### 📊 Enhanced Services Layer
- **Comprehensive Services**: 20+ service modules for business logic separation
- **Type Safety**: Full TypeScript integration with database types
- **Error Handling**: Consistent error handling across all services
- **Real-time Subscriptions**: Live data updates throughout the app

#### 🎨 UI/UX Improvements
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Loading States**: Consistent loading indicators throughout
- **Error States**: User-friendly error messages and recovery
- **Form Validation**: Real-time validation with helpful error messages
- **Accessibility**: Improved accessibility features

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

## 📱 Project Structure

```
capstone-project2/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (customer)/             # Customer-facing screens
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── index.tsx      # Home with AI recommendations
│   │   │   ├── menu.tsx
│   │   │   ├── cart.tsx
│   │   │   ├── orders.tsx
│   │   │   └── profile.tsx
│   │   └── product/[id].tsx    # Product detail page
│   ├── (admin)/                # Admin dashboard screens
│   │   ├── dashboard.tsx
│   │   ├── products/
│   │   ├── orders/
│   │   └── settings/
│   ├── (delivery)/             # Delivery staff screens
│   │   ├── dashboard.tsx
│   │   ├── orders.tsx
│   │   └── profile.tsx
│   └── _layout.tsx            # Root layout with session management
│
├── components/                 # Reusable UI components
│   ├── admin/                 # Admin-specific components
│   ├── auth/                  # Authentication components
│   ├── payment/               # Payment components (QR codes, proof upload)
│   ├── rider/                 # Rider/delivery components
│   ├── ui/                    # Generic UI components (Button, Input, Card, etc.)
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
│   └── ThemeContext.tsx
│
├── hooks/                      # Custom React hooks
│   ├── admin/                # Admin hooks
│   ├── useAuth.ts            # Authentication hook (replaces AuthContext)
│   ├── useCart.ts            # Shopping cart management
│   ├── useOrders.ts          # Order management
│   ├── useProducts.ts        # Product fetching
│   ├── useRecommendations.ts # AI recommendations
│   ├── useRiderProfile.ts    # Rider profile management
│   ├── useImageUpload.ts     # Image upload handling
│   └── index.ts              # Hook exports
│
├── services/                   # Business logic layer
│   ├── admin.service.ts      # Admin operations
│   ├── auth.service.ts       # Authentication
│   ├── order.service.ts      # Order management
│   ├── product.service.ts    # Product management
│   ├── recommendation.service.ts # AI recommendations
│   ├── rider.service.ts      # Rider operations
│   ├── auto-assignment.service.ts # Automatic order assignment
│   ├── qr-code.service.ts    # QR code generation
│   ├── image-upload.service.ts # Image uploads
│   ├── session.service.ts     # Session management
│   └── ...                    # 20+ service modules
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
│   └── ...                    # Other utilities
│
├── database/                   # Database setup scripts
│   ├── migrations/           # SQL migration files
│   ├── setup_avatars_bucket.sql
│   ├── setup_product_images_bucket.sql
│   └── ...                    # Additional setup scripts
│
├── supabase/                   # Supabase configuration
│   ├── functions/            # Edge Functions
│   │   └── recommendations/  # AI recommendation function
│   └── migrations/           # Database migrations
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

## 🗄 Database Schema

### Core Tables
- **`profiles`** - User profiles with role-based access (customer, admin, delivery)
- **`categories`** - Product categories
- **`products`** - Menu items with pricing, availability, and images
- **`orders`** - Customer orders with status tracking and payment information
- **`order_items`** - Individual items within orders with customization
- **`addresses`** - Customer delivery addresses
- **`product_stock`** - Inventory management with stock tracking
- **`payment_transactions`** - Payment records with verification status
- **`delivery_assignments`** - Rider-order assignments with status tracking
- **`riders`** - Rider profiles with availability and statistics
- **`notifications`** - User notifications for real-time updates
- **`saved_products`** - Customer favorite/saved products
- **`image_metadata`** - Image upload metadata and references

### Pizza Customization Tables
- **`pizza_options`** - Size and crust combinations
- **`crusts`** - Available crust types
- **`toppings`** - Available toppings
- **`pizza_topping_options`** - Topping availability per pizza option

### Database Functions
- **`get_featured_products(limit)`** - Returns top products based on order history
- **`calculate_rider_stats(rider_id)`** - Calculates rider statistics
- **`auto_assign_order(order_id)`** - Automatic order assignment function

### Enums
- **`order_status`**: `pending`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `delivered`, `cancelled`
- **`payment_status`**: `pending`, `verified`, `failed`
- **`payment_method`**: `cod`, `gcash`
- **`user_role`**: `customer`, `admin`, `delivery`

### Storage Buckets
- **`avatars`** - User profile pictures (public)
- **`product-images`** - Product images (public)
- **`payment-proofs`** - Payment verification images (private)
- **`delivery-proofs`** - Delivery confirmation images (private)

## 🏗 Architecture

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

### Authentication Flow
1. User signs in → Supabase Auth
2. Session stored → AsyncStorage + Zustand
3. Profile loaded → Database query
4. Role determined → Route protection
5. Session refreshed → Automatic token refresh every 5 minutes
6. Session restored → On app restart from storage

### Order Flow
1. **Customer**: Places order with customization
2. **Admin**: Receives order notification
3. **Admin**: Processes order and verifies payment (if GCash)
4. **System**: Auto-assigns to available rider (or manual assignment)
5. **Rider**: Accepts and picks up order
6. **Rider**: Delivers order and verifies payment (if COD)
7. **Rider**: Uploads proof of delivery
8. **Customer**: Receives real-time updates throughout

## 🛠 Development

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

## 📚 Documentation

Additional documentation files:
- `IMPLEMENTATION-SUMMARY.md` - AI recommendations and payment system
- `RIDER_IMPLEMENTATION_SUMMARY.md` - Rider management system
- `SESSION_MANAGEMENT_README.md` - Session persistence system
- `AVATAR_UPLOAD_SETUP_GUIDE.md` - Image upload setup
- `PRODUCT_IMAGE_UPLOAD_SETUP_GUIDE.md` - Product images setup
- `hooks/README.md` - Custom hooks documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the troubleshooting section
- Contact the development team

## 🔄 Version History

### v2.0.0 (Current) - Major Feature Release
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

**Kitchen One App** - Digitizing restaurant operations for better efficiency and customer satisfaction. 🍕✨

*Built with ❤️ using React Native, Expo, and Supabase*
