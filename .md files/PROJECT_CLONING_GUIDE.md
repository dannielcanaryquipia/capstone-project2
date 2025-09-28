# KitchenOneApp - Project Cloning Guide

This guide provides step-by-step instructions to clone and set up the KitchenOneApp project, a React Native/Expo restaurant management application with Supabase backend.

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Git
- Supabase account
- Mobile device with Expo Go app (for testing) or Android Studio/Xcode (for emulators)

## 1. Project Setup

### 1.1 Clone the Repository
```bash
git clone [repository-url]
cd KitchenOneApp
```

### 1.2 Install Dependencies
```bash
npm install
# or
yarn install
```

## 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Supabase Setup

### 3.1 Create a New Project
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Get your project URL and anon public key from Project Settings > API
3. Update the `.env` file with these credentials

### 3.2 Database Configuration
1. **Enable Required Extensions**:
   ```sql
   create extension if not exists "uuid-ossp";
   create extension if not exists "pgcrypto";
   ```

2. **Set Up Row Level Security (RLS)**:
   - Enable RLS on all tables
   - Create appropriate policies for each role
   - Set up security definer functions for complex operations

3. **Storage Setup**:
   - Create buckets for product images and user uploads
   - Set up CORS rules
   - Configure storage policies

### 3.3 Authentication Setup
1. Enable Email/Password authentication in Supabase Auth
2. Configure Site URL and Redirect URLs in Authentication settings
3. Set up email templates for:
   - Email confirmation
   - Password reset
   - Magic link authentication

### 3.2 Database Schema
Run the following SQL in the Supabase SQL Editor to set up the database schema:

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Set up custom types
create type user_role as enum ('customer', 'admin', 'delivery');
create type order_status as enum ('pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
create type payment_method as enum ('cod', 'gcash');
create type payment_status as enum ('pending', 'paid', 'failed');

-- Create tables with proper relationships
-- (Include your complete database schema here)
```

## 4. Initial Setup Scripts

### 4.1 Database Initialization
Create a `scripts/init-db.sql` file with:
```sql
-- Database schema setup
-- Include all your table creation scripts
-- Insert initial data (admin user, product categories, etc.)
```

### 4.2 Seed Data
Create a `scripts/seed-data.sql` file with:
- Sample products
- Test user accounts
- Sample orders
- Any other reference data

### 4.3 Environment Setup Script
Create a `setup-env.sh` script:
```bash
#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env <<EOL
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOL
    echo "Please update .env with your Supabase credentials"
else
    echo ".env file already exists"
fi
```

## 5. Design System & Theming

### 5.1 Color Palette
```typescript
// constants/Colors.ts
export const lightTheme = {
  // Brand Colors
  primary: '#FEDC00',
  primaryLight: '#FFE44D',
  primaryDark: '#E6C600',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Text & Background
  text: '#333333',
  textSecondary: '#666666',
  background: '#F1EFEC',
  card: '#FFFFFF',
  
  // Additional Colors
  border: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.5)',
  // ... other colors
};
```

### 5.2 Typography
```typescript
// constants/Fonts.ts
export const Fonts = {
  primary: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  display: {
    regular: 'PlayfairDisplay_400Regular',
    italic: 'PlayfairDisplay_400Italic',
  },
};

// Text Variants
export const TextVariants = {
  h1: { fontSize: 32, fontFamily: Fonts.primary.bold },
  h2: { fontSize: 24, fontFamily: Fonts.primary.semiBold },
  body: { fontSize: 16, fontFamily: Fonts.primary.regular },
  button: { fontSize: 16, fontFamily: Fonts.primary.medium },
  // ... other variants
};
```

### 5.3 Spacing & Layout
```typescript
// constants/Layout.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // ... other shadow variants
};
```

### 5.4 Theme Context

Create a theme context to manage light/dark mode across the app:

```tsx
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../constants/Colors';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Optionally save preference to AsyncStorage
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### 5.5 Reusable Components

#### Button Component Implementation

Here's the complete implementation of the Button component with theming support:

```tsx
// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Layout';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: object;
  textStyle?: object;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) => {
  const { theme } = useTheme();
  
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing[size === 'sm' ? 'md' : 'lg'],
      paddingVertical: size === 'sm' ? Spacing.sm : Spacing.md,
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.surfaceVariant,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          paddingHorizontal: Spacing.sm,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontFamily: 'Poppins_500Medium',
      fontSize: size === 'sm' ? 14 : 16,
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, color: theme.textInverse };
      case 'secondary':
        return { ...baseStyle, color: theme.text };
      case 'outline':
      case 'text':
        return { ...baseStyle, color: theme.primary };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' ? theme.textInverse : theme.primary
          }
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon && (
            <View style={[styles.icon, { marginRight: Spacing.sm }]}>
              {leftIcon}
            </View>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && (
            <View style={[styles.icon, { marginLeft: Spacing.sm }]}>
              {rightIcon}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```tsx
// components/common/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
}: ButtonProps) => {
  const { theme } = useTheme();
  
  // ... component implementation
};
```

#### Card Component Implementation

Here's the complete implementation of the Card component with theming support:

```tsx
// components/common/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { BorderRadius, Shadow } from '../../constants/Layout';

type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

export const Card = ({
  children,
  variant = 'elevated',
  style,
  contentStyle,
  onPress,
  disabled = false,
  ...props
}: CardProps) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          ...Shadow.sm,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.surfaceVariant,
        };
      default:
        return baseStyle;
    }
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  content: {
    padding: 16,
  },
});

// Usage Example:
/*
<Card variant="elevated" style={{ marginBottom: 16 }}>
  <Text style={{ fontSize: 16, marginBottom: 8 }}>Card Title</Text>
  <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
    This is a sample card with some content.
  </Text>
</Card>
*/
```
```tsx
// components/common/Card.tsx
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

type CardProps = {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  style?: object;
};

export const Card = ({
  children,
  variant = 'elevated',
  style,
}: CardProps) => {
  const { theme } = useTheme();
  
  // ... component implementation
};
```

### 5.6 Form Components

#### TextInput Component

```tsx
// components/common/TextInput.tsx
import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps, View, Text, TextInput as RNTextInputType } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/Layout';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: object;
}

export const TextInput = forwardRef<RNTextInputType, CustomTextInputProps>(
  ({ label, error, leftIcon, rightIcon, style, containerStyle, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.surfaceVariant,
              borderColor: error ? theme.error : theme.border,
              borderWidth: 1,
              borderRadius: BorderRadius.md,
            },
          ]}
        >
          {leftIcon && (
            <View style={[styles.icon, { marginRight: Spacing.sm }]}>{leftIcon}</View>
          )}
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: theme.text,
                flex: 1,
                paddingVertical: Spacing.sm,
                paddingHorizontal: Spacing.md,
              },
              style,
            ]}
            placeholderTextColor={theme.textTertiary}
            {...props}
          />
          {rightIcon && (
            <View style={[styles.icon, { marginLeft: Spacing.sm }]}>{rightIcon}</View>
          )}
        </View>
        {error && (
          <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    marginBottom: Spacing.xs,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
});
```

## 6. System Architecture & User Flows

### 6.1 Authentication Flow

#### Auth Hook (`useAuth.ts`)
```typescript
// hooks/useAuth.ts
interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: 'customer' | 'admin' | 'delivery_staff' | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    error: null,
  });

  // Core authentication methods
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) await getProfile(data.user.id);
      return { data, error: null };
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error.message }));
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  // Other auth methods (signUp, signOut, getSession, getProfile)
  // ...

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshSession: getSession,
  };
};
```

### 6.2 Customer Flow

#### Key Hooks
- `useCart()`: Manages shopping cart state and operations
- `useMenu()`: Fetches and filters menu items
- `useOrders()`: Manages customer's order history
- `useAddresses()`: Handles saved delivery addresses

#### Customer Features
1. **Browse Menu**
   - View categories and items
   - Filter by dietary preferences
   - Search functionality

2. **Order Placement**
   - Add/remove items to cart
   - Customize orders (e.g., special instructions)
   - Select delivery address
   - Choose payment method (COD/GCash)
   - Place order with real-time status tracking

### 6.3 Admin Flow

#### Key Hooks
- `useAdminDashboard()`: Fetches analytics and KPIs
- `useAdminOrders()`: Manages all orders
- `useAdminProducts()`: Handles menu management
- `useAdminUsers()`: Manages user accounts

#### Admin Features
1. **Dashboard**
   - Sales analytics
   - Order volume metrics
   - Revenue reports

2. **Order Management**
   - View all orders
   - Update order status
   - Handle refunds/cancellations

### 6.4 Delivery Staff Flow

#### Key Hooks
- `useDeliveryOrders()`: Fetches assigned orders
- `useLocation()`: Tracks delivery location
- `useNavigation()`: Handles navigation to delivery addresses

#### Delivery Features
1. **Order Assignment**
   - View newly assigned orders
   - Accept/reject orders
   - View order details and delivery address

2. **Delivery Management**
   - Update order status (Picked Up, On the Way, Delivered)
   - Navigate to delivery location
   - Handle delivery issues

## 7. Project Structure

```
KitchenOneApp/
├── app/                    # Main application code
│   ├── (admin)/            # Admin panel routes
│   ├── (auth)/             # Authentication screens
│   ├── (customer)/         # Customer-facing routes
│   ├── (delivery)/         # Delivery staff routes
│   └── _layout.tsx         # Root layout
├── assets/                 # Static assets
│   ├── fonts/              # Custom fonts
│   └── images/             # App images
├── components/             # Reusable components
│   └── common/             # Common UI components
├── constants/              # App constants
│   ├── Colors.ts           # Color scheme
│   ├── Fonts.ts            # Typography
│   ├── Layout.ts           # Layout constants
│   └── Strings.ts          # String constants
├── contexts/               # React contexts
├── database/               # Database scripts
├── hooks/                  # Custom hooks
├── lib/                    # Core libraries
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
└── types/                  # TypeScript type definitions

## 14. Development Workflow

### 6.1 Code Organization
- **Components**: Reusable UI elements
- **Hooks**: Custom hooks for data fetching and state management
- **Utils**: Helper functions and formatters
- **System Flows**: Documentation for user role-specific system flows

### 6.2 Code Style
- **ESLint**: For code quality
- **Prettier**: For code formatting
- **TypeScript**: Strict typing throughout the application
- **Naming Conventions**:
  - Components: PascalCase (e.g., `ProductCard.tsx`)
  - Hooks: `use` prefix (e.g., `useCart.ts`)
  - Utils: camelCase (e.g., `formatPrice.ts`)

### 6.3 Git Workflow
1. Create feature branches from `main`
2. Follow conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `chore:` for maintenance tasks
3. Open pull requests for code review
4. Squash and merge approved PRs

## 7. Running the App

### Development
```bash
# Start the development server
expo start

# Or run on specific platform
expo start --ios
expo start --android
expo start --web
```

### Building for Production
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for web
expo export:web
```

## 15. Testing Strategy

### 8.1 Unit Tests
- **Components**: Test rendering and interactions
- **Hooks**: Test state management and side effects
- **Utils**: Test pure functions

### 8.2 Integration Tests
- **API Integration**: Test Supabase interactions
- **Navigation**: Test navigation flows
- **State Management**: Test store actions and reducers

### 8.3 E2E Tests
- **Critical User Flows**:
  - User registration and login
  - Browsing and adding to cart
  - Placing an order
  - Admin order management
  - Delivery status updates

### 8.4 Test Setup
- **Jest**: Test runner
- **React Testing Library**: For component testing
- **Mock Service Worker**: For API mocking
- **Detox**: For E2E testing

### Unit Tests
```bash
npm test
```

### E2E Tests
(Add your E2E testing setup instructions here)

## 16. Deployment

### 8.1 Supabase
- Set up Row Level Security (RLS) policies
- Configure storage buckets
- Set up database functions and triggers

### 8.2 App Stores
- Follow Expo's deployment guides for App Store and Google Play
- Set up environment-specific configurations

## 17. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| EXPO_PUBLIC_SUPABASE_URL | Your Supabase project URL | Yes |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Your Supabase anon/public key | Yes |

## 18. Advanced Features

### 11.1 Real-time Updates
- **Order Status**: Live order status updates
- **Menu Changes**: Real-time menu updates for admins
- **Inventory Management**: Stock level updates

### 11.2 Offline Support
- **Data Persistence**: Cached menu and order data
- **Queue System**: Queue actions when offline
- **Sync on Reconnect**: Automatic data sync when back online

### 11.3 Performance Optimizations
- **Image Optimization**: Lazy loading and placeholders
- **Code Splitting**: Route-based code splitting
- **Memoization**: Prevent unnecessary re-renders
- **Bundle Analysis**: Keep bundle size in check

## 19. Troubleshooting

### Common Issues
1. **Missing environment variables**: Ensure `.env` file exists and contains all required variables
2. **Authentication errors**: Verify Supabase URL and anon key
3. **Font loading issues**: Check font files in assets/fonts/
4. **Database connection**: Verify Supabase project settings and RLS policies

### Getting Help
- Check the [Expo documentation](https://docs.expo.dev/)
- Refer to [Supabase documentation](https://supabase.com/docs)
- Check GitHub issues for similar problems

## 20. Contributing

### 13.1 Development Setup
1. Fork the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Start the development server with `expo start`

### 13.2 Code Review Process
1. Open a pull request with a clear description
2. Ensure all tests pass
3. Update documentation as needed
4. Get approval from at least one maintainer

### 13.3 Feature Requests
- Open an issue with the "enhancement" label
- Describe the use case and expected behavior
- Reference any related issues

## 21. Post-Setup Verification

### 14.1 Smoke Tests
After setup, verify:
1. App builds and runs without errors
2. User can register and login
3. Products are visible in the menu
4. Cart functionality works
5. Order placement works
6. Admin dashboard is accessible with admin credentials

### 14.2 Common Setup Issues
- **Font Loading Issues**: Ensure all fonts are properly linked in `app/_layout.tsx`
- **API Connection Errors**: Verify Supabase URL and anon key
- **Database Permission Issues**: Check RLS policies in Supabase
- **Build Failures**: Ensure all dependencies are installed

## 22. License

[Your License Here]

---
*This guide was generated for KitchenOneApp. Update it with your specific project details and requirements.*

## Changelog

### [1.0.0] - 2025-09-16
- Initial project setup and documentation
- Core features implemented
- Basic testing coverage

## Acknowledgments
- [Expo](https://expo.dev/) for the amazing development experience
- [Supabase](https://supabase.com/) for the open source backend
- The React Native community for their contributions
