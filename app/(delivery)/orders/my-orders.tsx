import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { OrderCard } from '../../../components/ui/OrderCard';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { TabBar, TabItem } from '../../../components/ui/TabBar';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useMyDeliveryOrders } from '../../../hooks/useDeliveryOrders';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../types/order.types';

const statusTabs: TabItem[] = [
  { key: 'All', label: 'All' },
  { key: 'Out for Delivery', label: 'Out for Delivery' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
];

export default function MyOrdersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { orders, isLoading: loading, error, refresh } = useMyDeliveryOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Out for Delivery') return order.status === 'out_for_delivery';
    if (activeTab === 'Delivered') return order.status === 'delivered';
    if (activeTab === 'Cancelled') return order.status === 'cancelled';
    return true;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMarkDelivered = async (orderId: string) => {
    Alert.alert(
      'Mark as Delivered',
      'How would you like to confirm delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip Photo', onPress: async () => {
          try {
            if (!user?.id) throw new Error('Not authenticated');
            await OrderService.markOrderDelivered(orderId, user.id);
            Alert.alert('Success', 'Order marked as delivered successfully!');
            await refresh();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to mark delivered');
          }
        }},
        { text: 'Take Photo', onPress: async () => {
          try {
            const res = await ImagePicker.launchCameraAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.8,
              allowsEditing: true,
              aspect: [4, 3]
            });
            if (!res.canceled) {
              const uri = res.assets[0].uri;
              if (!user?.id) throw new Error('Not authenticated');
              await OrderService.markOrderDelivered(orderId, user.id, uri);
              Alert.alert('Success', 'Order marked as delivered with proof photo!');
              await refresh();
            }
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to take photo');
          }
        }},
        { text: 'Choose from Gallery', onPress: async () => {
          try {
            const res = await ImagePicker.launchImageLibraryAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.8,
              allowsEditing: true,
              aspect: [4, 3]
            });
            if (!res.canceled) {
              const uri = res.assets[0].uri;
              if (!user?.id) throw new Error('Not authenticated');
              await OrderService.markOrderDelivered(orderId, user.id, uri);
              Alert.alert('Success', 'Order marked as delivered with proof photo!');
              await refresh();
            }
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to select photo');
          }
        }}
      ]
    );
  };

  const handleVerifyCODPayment = async (orderId: string) => {
    Alert.alert(
      'Verify COD Payment',
      'Have you received the cash payment from the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify Payment', onPress: async () => {
          try {
            if (!user?.id) throw new Error('Not authenticated');
            await OrderService.verifyCODPayment(orderId, user.id);
            Alert.alert('Success', 'COD payment verified successfully!');
            await refresh();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to verify payment');
          }
        }}
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return 'delivery-dining';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isCOD = item.payment_method === 'cod';
    const needsPaymentVerification = isCOD && item.payment_status === 'pending' && item.status === 'out_for_delivery';
    const needsDeliveryConfirmation = item.status === 'out_for_delivery';

    // For COD orders that need payment verification, show Verify Payment button
    if (needsPaymentVerification) {
      return (
        <OrderCard
          order={item}
          onPress={() => router.push(`/(delivery)/order-details/${item.id}` as any)}
          showCustomerInfo={true}
          showDeliveryInfo={true}
          showActionButton={true}
          actionButtonTitle="Verify Payment"
          onActionPress={() => handleVerifyCODPayment(item.id)}
          variant="detailed"
        />
      );
    }

    // For orders that need delivery confirmation, show Mark as Delivered button
    if (needsDeliveryConfirmation) {
      return (
        <OrderCard
          order={item}
          onPress={() => router.push(`/(delivery)/order-details/${item.id}` as any)}
          showCustomerInfo={true}
          showDeliveryInfo={true}
          showActionButton={true}
          actionButtonTitle="Mark as Delivered"
          onActionPress={() => handleMarkDelivered(item.id)}
          variant="detailed"
        />
      );
    }

    // For other orders, show without action button
    return (
      <OrderCard
        order={item}
        onPress={() => router.push(`/(delivery)/order-details/${item.id}` as any)}
        showCustomerInfo={true}
        showDeliveryInfo={true}
        showActionButton={false}
        variant="detailed"
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingState 
          message={Strings.loading} 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView style={styles.header}>
        <ResponsiveText size="xl" weight="bold" color={colors.text}>
          My Deliveries
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Track your assigned delivery orders
        </ResponsiveText>
      </ResponsiveView>

      {/* Status Tabs */}
      <TabBar
        tabs={statusTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        horizontal
        showScrollIndicator={false}
        variant="pills"
      />

      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="delivery-dining"
          title="No Deliveries Found"
          description={activeTab === 'All' 
            ? 'No delivery orders assigned to you yet.'
            : `No ${activeTab.toLowerCase()} deliveries found.`
          }
          actionTitle="Check Available Orders"
          onActionPress={() => router.push('/(delivery)/orders/available' as any)}
          showAction={true}
          fullScreen
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  ordersList: {
    padding: 20,
    paddingTop: 0,
  },
});
