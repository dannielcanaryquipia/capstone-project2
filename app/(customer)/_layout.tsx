import { Stack } from 'expo-router';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { SavedProductsProvider } from '../../contexts/SavedProductsContext';

export default function CustomerLayout() {
  return (
    <SavedProductsProvider>
      <NotificationProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="menu/index" options={{ headerShown: false }} />
          <Stack.Screen name="menu/[category]" options={{ headerShown: false }} />
          <Stack.Screen name="notification" options={{ headerShown: false }} />
          <Stack.Screen name="orders/index" options={{ headerShown: false }} />
          <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="profile/addresses" options={{ headerShown: false }} />
          <Stack.Screen name="profile/address-form" options={{ headerShown: false }} />
          <Stack.Screen name="profile/payment-methods" options={{ headerShown: false }} />
          <Stack.Screen name="profile/help-support" options={{ headerShown: false }} />
          <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
        </Stack>
      </NotificationProvider>
    </SavedProductsProvider>
  );
}
