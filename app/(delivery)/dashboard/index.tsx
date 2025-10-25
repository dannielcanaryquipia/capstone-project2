import { useRouter } from 'expo-router';
import React from 'react';
import RiderDashboard from '../../../components/rider/RiderDashboard';

export default function DeliveryDashboard() {
  const router = useRouter();

  return (
    <RiderDashboard 
      onNavigateToOrders={() => router.push('/(delivery)/orders' as any)}
      onNavigateToProfile={() => router.push('/(delivery)/profile' as any)}
    />
  );
}