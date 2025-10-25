import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider
} from 'react-native-paper';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from '../components/ui/AlertProvider';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { NotificationTriggersService } from '../services/notification-triggers.service';
import { sessionService } from '../services/session.service';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)/sign-in',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This can be used to protect routes that require authentication
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isInitialized, isAdmin, isDelivery, error } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't navigate until auth is initialized
    if (!isInitialized || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inDeliveryGroup = segments[0] === '(delivery)';
    const inCustomerGroup = segments[0] === '(customer)';

    if (!user && !inAuthGroup) {
      // User not logged in and not in auth group, redirect to sign in
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // User logged in but in auth group, redirect to appropriate dashboard
      if (isAdmin) {
        router.replace('/(admin)/dashboard');
      } else if (isDelivery) {
        router.replace('/(delivery)/dashboard');
      } else {
        router.replace('/(customer)/(tabs)');
      }
    } else if (user && !inAuthGroup) {
      // User logged in but in wrong role-based section
      if (isAdmin && !inAdminGroup) {
        router.replace('/(admin)/dashboard');
      } else if (isDelivery && !inDeliveryGroup) {
        router.replace('/(delivery)/dashboard');
      } else if (!isAdmin && !isDelivery && !inCustomerGroup) {
        router.replace('/(customer)/(tabs)');
      }
    }
  }, [user, isLoading, isInitialized, segments, isAdmin, isDelivery, router]);

  // Show loading screen while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show error screen if there's an auth error
  if (error && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          Authentication error. Please try again.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

// Create custom themes
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#4F46E5',
    accent: '#6366F1',
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#6366F1',
    accent: '#818CF8',
  },
};

// Theme integration component
function ThemedApp() {
  const { colors, isDark } = useTheme();
  
  // Create navigation themes based on our custom theme
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.notification,
    },
    fonts: {
      regular: {
        fontFamily: 'PoppinsRegular',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'PoppinsMedium',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'PoppinsBold',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'PoppinsBlack',
        fontWeight: '900' as const,
      },
    },
  };

  // Create Paper theme based on our custom theme
  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      onBackground: colors.text,
      onPrimary: colors.textInverse,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <NotificationProvider>
          <AlertProvider>
            <RootLayoutNav />
          </AlertProvider>
        </NotificationProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function AppContent() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PoppinsBlack: require('../assets/fonts/Poppins-Black.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsLight: require('../assets/fonts/Poppins-Light.ttf'),
    PlayfairDisplay: require('../assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
    ...FontAwesome.font,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Initialize notification triggers
      NotificationTriggersService.initializeNotificationTriggers();
      // Initialize session management
      sessionService.initialize();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <ThemedApp />;
}

export default function RootLayout() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppThemeProvider>
          <SafeAreaProvider>
            <AuthGuard>
              <AppContent />
            </AuthGuard>
          </SafeAreaProvider>
        </AppThemeProvider>
        {Platform.OS === 'web' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}