# Kitchen One App

> **Note**: This is a template README for recreating the project. The only issues you might encounter are with TypeScript configuration and node_modules installation.

A comprehensive restaurant management application built with React Native, Expo, and Supabase. This app digitizes the operations of Kitchen One Bulan, providing food ordering, delivery tracking, inventory management, and role-based access control.

## ⚠️ Common Issues & Solutions

### TypeScript Errors
If you encounter TypeScript errors after setup:
1. Ensure all TypeScript dependencies are installed:
   ```bash
   npm install --save-dev typescript @types/react @types/react-native @types/node
   ```
2. Check your `tsconfig.json` for proper configuration
3. Run `npx tsc --noEmit` to check for TypeScript errors

### Node.js Version Issues
If you get Node.js version errors:
1. Use `nvm` (Node Version Manager) to manage Node.js versions:
   ```bash
   nvm install 18.17.0
   nvm use 18.17.0
   ```

### Module Resolution Issues
If you see "Module not found" errors:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```
2. Check your `tsconfig.json` paths configuration

## 🚀 Features

### Customer Features
- **Digital Menu**: Browse and search food items by category
- **Order Management**: Place orders with customization options
- **Real-time Tracking**: Track order status from placement to delivery
- **Payment Options**: Support for Cash on Delivery (COD) and GCash
- **AI Recommendations**: Personalized menu suggestions based on order history
- **Address Management**: Save and manage delivery addresses
- **Order History**: View past orders and reorder functionality

### Admin Features
- **Dashboard**: Overview of orders, sales, and inventory
- **Menu Management**: Add, edit, and manage products and categories
- **Order Management**: Process orders, update status, and assign delivery
- **Payment Verification**: Verify GCash payments and manage payment status
- **Inventory Management**: Monitor stock levels and set low stock alerts
- **User Management**: Manage customer and delivery staff accounts
- **Reports**: Generate sales and inventory reports

### Delivery Staff Features
- **Assigned Orders**: View and manage assigned deliveries
- **Delivery Tracking**: Update delivery status and confirm payments
- **Route Management**: Access customer locations and delivery instructions

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Authentication**: Supabase Auth with Role-Based Access Control
- **State Management**: Zustand + React Query
- **Navigation**: Expo Router
- **Styling**: Centralized design system with TypeScript
- **Image Storage**: Supabase Storage
- **Real-time Updates**: Supabase Realtime

## 🛠 Development Scripts

- `npm start`: Start the development server
- `npm run android`: Run on Android device/emulator
- `npm run ios`: Run on iOS simulator (macOS only)
- `npm run web`: Run in web browser
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run type-check`: Check TypeScript types

## 📱 Project Structure

```
KitchenOneApp/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (customer)/        # Customer-facing screens
│   ├── (admin)/           # Admin dashboard screens
│   └── (delivery)/        # Delivery staff screens
├── components/            # Reusable UI components
│   ├── common/           # Generic components (Button, Input, Card)
│   ├── product/          # Product-specific components
│   ├── order/            # Order-specific components
│   └── layout/           # Layout components
├── constants/            # App-wide constants and styling
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
└── assets/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17.0 (LTS) or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Expo CLI**: Latest version (`npm install -g expo-cli`)
- **Supabase Account**: [Sign up here](https://supabase.com/)
- **Git**: For version control
- **Watchman** (macOS/Linux): For file watching
- **Android Studio** (Android) / **Xcode** (iOS): For mobile development

### Supabase Email Verification Setup

To enable email verification, you need to configure the following in your Supabase project:

1. **Go to Authentication > URL Configuration** in your Supabase dashboard
2. **Add your redirect URLs:**
   - `kitchenoneapp://auth/callback` (for mobile app)
   - `http://localhost:8081/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production web)

3. **Configure email templates** in Authentication > Emails
4. **Enable email confirmation** in Authentication > Settings

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KitchenOneApp
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install

   # Install iOS dependencies (if on macOS)
   npx expo install
   
   # Install TypeScript types
   npm install --save-dev @types/react @types/react-native @types/node
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Supabase
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Optional: For development
   EXPO_PUBLIC_ENV=development
   
   # Optional: For deep linking
   EXPO_PUBLIC_APP_SCHEME=kitchenoneapp
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database schema (see Database Setup section)
   - Configure Row Level Security (RLS) policies
   - Set up storage buckets for images

5. **Start the development server**
   ```bash
   npm start
   ```

## 🗄 Database Setup

The app uses the following Supabase schema:

### Core Tables
- `profiles` - User profiles with role-based access
- `categories` - Product categories
- `products` - Menu items with pricing and availability
- `orders` - Customer orders with status tracking
- `order_items` - Individual items within orders
- `addresses` - Customer delivery addresses
- `product_stock` - Inventory management

### Pizza-specific Tables
- `pizza_options` - Size and crust options
- `crusts` - Available crust types
- `toppings` - Available toppings
- `pizza_topping_options` - Topping availability per pizza option

### Enums
- `order_status` - Pending, Preparing, Ready for Pickup, Out for Delivery, Delivered, Cancelled
- `payment_status` - Pending, Verified, Failed

## 🎨 Design System

The app uses a centralized design system with:

### Colors
- **Primary**: Orange (#FF6F00) - Main brand color
- **Secondary**: Green (#4CAF50) - Success and delivery
- **Accent**: Blue (#2196F3) - Info and links
- **Status Colors**: Specific colors for order and payment status

### Typography
- Consistent font sizes and weights
- Responsive text scaling
- Proper line heights for readability

### Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: Form inputs with validation and error states
- **Card**: Content containers with different elevation levels
- **LoadingSpinner**: Loading states throughout the app

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)
- **Customer**: Place orders, view menu, track orders
- **Admin**: Full system access and management
- **Delivery Staff**: View assigned orders and update delivery status

### Security Features
- Supabase Row Level Security (RLS)
- JWT token management
- Secure password handling
- Input validation and sanitization

## 📊 State Management

### Global State (Zustand)
- Authentication state
- Cart management
- User preferences

### Server State (React Query)
- Product data
- Order management
- Real-time updates

## 🔄 Real-time Features

- Live order status updates
- Real-time inventory changes
- Instant payment verification
- Live delivery tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## 🚀 Deployment

1. **Configure production environment**
2. **Set up Supabase production instance**
3. **Configure app store credentials**
4. **Build and submit to app stores**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- Customer ordering and tracking
- Admin dashboard and management
- Delivery staff functionality
- AI-based recommendations

## 🎯 Roadmap

- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline functionality
- [ ] Advanced AI recommendations
- [ ] Integration with payment gateways
- [ ] Customer reviews and ratings

---

**Kitchen One App** - Digitizing restaurant operations for better efficiency and customer satisfaction. 