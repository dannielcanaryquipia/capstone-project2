import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth as useAuthContext } from '../../contexts/AuthContext';
import { Text } from '../ui/Text';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'delivery' | 'customer';
  loadingComponent?: React.ReactNode;
  unauthorizedRedirect?: string;
};

export const ProtectedRoute = ({
  children,
  requiredRole,
  loadingComponent,
  unauthorizedRedirect = '/unauthorized',
}: ProtectedRouteProps) => {
  const { user, session, isLoading, isAdmin, isDelivery } = useAuthContext();

  if (isLoading) {
    return loadingComponent || (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // If no user is logged in, redirect to sign-in
  if (!user || !session) {
    return <Redirect href="/sign-in" />;
  }

  // Check role-based access
  if (requiredRole) {
    const hasRole = 
      (requiredRole === 'admin' && isAdmin) ||
      (requiredRole === 'delivery' && isDelivery) ||
      (requiredRole === 'customer' && !isAdmin && !isDelivery);

    if (!hasRole) {
      return <Redirect href={unauthorizedRedirect as any} />;
    }
  }

  return <>{children}</>;
};

// Helper components for common use cases
export const AdminRoute = (props: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="admin" {...props} />
);

export const DeliveryRoute = (props: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="delivery" {...props} />
);

export const CustomerRoute = (props: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="customer" {...props} />
);
