import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Layout from '../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../constants/Responsive';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useRiderOrders } from '../../hooks/useRiderProfile';
import global from '../../styles/global';
import Button from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { ResponsiveText } from '../ui/ResponsiveText';
import { ResponsiveView } from '../ui/ResponsiveView';

interface RiderOrdersManagerProps {
  showAvailableOrders?: boolean;
  showAssignedOrders?: boolean;
  showRecentOrders?: boolean;
  showDeliveredOrders?: boolean;
}

export default function RiderOrdersManager({
  showAvailableOrders = true,
  showAssignedOrders = true,
  showRecentOrders = true,
  showDeliveredOrders = true,
}: RiderOrdersManagerProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    assignedOrders, 
    availableOrders, 
    recentOrders, 
    deliveredOrders,
    isLoading, 
    error, 
    acceptOrder,
    markPickedUp,
    verifyCODPayment,
    markDelivered,
    refresh 
  } = useRiderOrders();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await acceptOrder(orderId);
      Alert.alert('Success! ✅', 'Order accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPickedUp = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      await markPickedUp(orderId);
      Alert.alert('Success! 📦', 'Order marked as picked up');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark as picked up');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyCODPayment = async (orderId: string) => {
    Alert.alert(
      'Verify COD Payment',
      'Confirm that you have received cash payment from the customer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Verify Payment', 
          onPress: async () => {
            try {
              setActionLoading(orderId);
              await verifyCODPayment(orderId);
              Alert.alert('Success! 💰', 'COD payment verified successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to verify payment');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleMarkDelivered = async (orderId: string) => {
    Alert.alert(
      'Mark as Delivered',
      'Please take a photo as proof of delivery',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: async () => {
          try {
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false, // Removed cropping requirement - allow full image
            });
            if (!res.canceled) {
              setActionLoading(orderId);
              const result = await markDelivered(orderId, res.assets[0].uri);
              if (result?.success) {
                Alert.alert(
                  result.proofUploaded ? 'Success! 📸' : 'Success! ✅', 
                  result.message
                );
              } else {
                Alert.alert('Error', result?.message || 'Failed to mark as delivered');
              }
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to take photo');
          } finally {
            setActionLoading(null);
          }
        }},
        { text: 'Choose from Gallery', onPress: async () => {
          try {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: false, // Removed cropping requirement - allow full image
            });
            if (!res.canceled) {
              setActionLoading(orderId);
              const result = await markDelivered(orderId, res.assets[0].uri);
              if (result?.success) {
                Alert.alert(
                  result.proofUploaded ? 'Success! 📸' : 'Success! ✅', 
                  result.message
                );
              } else {
                Alert.alert('Error', result?.message || 'Failed to mark as delivered');
              }
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to select photo');
          } finally {
            setActionLoading(null);
          }
        }}
      ]
    );
  };

  const getOrderActions = (order: any, assignment?: any) => {
    const status = order.status?.toLowerCase();
    const paymentMethod = order.payment_method?.toLowerCase();
    const paymentVerified = order.payment_verified;
    const assignmentStatus = assignment?.status;

    // Available orders - show accept button
    if (status === 'ready_for_pickup' && !assignment) {
      return (
        <Button
          title="Accept Order"
          onPress={() => handleAcceptOrder(order.id)}
          variant="primary"
          size="small"
          loading={actionLoading === order.id}
          disabled={actionLoading === order.id}
        />
      );
    }

    // Assigned orders - show appropriate action based on status
    if (assignment) {
      if (assignmentStatus === 'Assigned') {
        return (
          <Button
            title="Mark as Picked Up"
            onPress={() => handleMarkPickedUp(order.id)}
            variant="primary"
            size="small"
            loading={actionLoading === order.id}
            disabled={actionLoading === order.id}
          />
        );
      }

      if (assignmentStatus === 'Picked Up') {
        // COD orders need payment verification first
        if (paymentMethod === 'cod' && !paymentVerified) {
          return (
            <Button
              title="Verify COD Payment"
              onPress={() => handleVerifyCODPayment(order.id)}
              variant="primary"
              size="small"
              loading={actionLoading === order.id}
              disabled={actionLoading === order.id}
            />
          );
        }

        // GCash orders need admin verification (show info message)
        if (paymentMethod === 'gcash' && !paymentVerified) {
          return (
            <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
              <MaterialIcons name="info" size={16} color={colors.warning} />
              <ResponsiveView marginLeft="xs">
                <ResponsiveText size="xs" color={colors.warning} weight="medium">
                  Waiting for admin to verify GCash payment
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          );
        }

        // Ready for delivery
        return (
          <Button
            title="Mark as Delivered"
            onPress={() => handleMarkDelivered(order.id)}
            variant="primary"
            size="small"
            loading={actionLoading === order.id}
            disabled={actionLoading === order.id}
          />
        );
      }
    }

    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned': return colors.primary;
      case 'picked up': return colors.warning;
      case 'delivered': return colors.success;
      case 'available': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'assigned': return 'assignment';
      case 'picked up': return 'local-shipping';
      case 'delivered': return 'check-circle';
      case 'available': return 'schedule';
      default: return 'help';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <LoadingState 
          message="Loading orders..." 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="lg" color={colors.error} align="center">
            Error loading orders
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="sm">
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            {error}
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="lg">
          <Button
            title="Retry"
            onPress={handleRefresh}
            variant="primary"
            size="medium"
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ResponsiveView padding="lg">
          {/* Debug Info */}
          {__DEV__ && (
            <ResponsiveView style={[styles.debugCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ResponsiveText size="sm" color={colors.textSecondary}>
                Debug Info:
              </ResponsiveText>
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Available: {availableOrders.length} | Assigned: {assignedOrders.length} | Recent: {recentOrders.length} | Delivered: {deliveredOrders.length}
              </ResponsiveText>
              {error && (
                <ResponsiveText size="xs" color={colors.error}>
                  Error: {error}
                </ResponsiveText>
              )}
            </ResponsiveView>
          )}

          {/* Available Orders */}
          {showAvailableOrders && availableOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveView flexDirection="row" alignItems="center">
                  <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                    Available Orders
                  </ResponsiveText>
                  {availableOrders.some(order => {
                    const orderDate = new Date(order.created_at);
                    const now = new Date();
                    const minutesAgo = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                    return minutesAgo <= 10;
                  }) && (
                    <ResponsiveView 
                      style={[styles.newIndicator, { backgroundColor: colors.primary }]}
                      marginLeft="xs"
                    >
                      <MaterialIcons name="fiber-new" size={16} color={colors.textInverse} />
                    </ResponsiveView>
                  )}
                </ResponsiveView>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {availableOrders.length} orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.ordersList}>
                {availableOrders.map((order) => {
                  // Check if order is new (created in last 10 minutes)
                  const orderDate = new Date(order.created_at);
                  const now = new Date();
                  const minutesAgo = (now.getTime() - orderDate.getTime()) / (1000 * 60);
                  const isNewOrder = minutesAgo <= 10;
                  
                  return (
                    <TouchableOpacity
                      key={order.id}
                      style={[
                        styles.orderCard, 
                        { backgroundColor: colors.surface },
                        isNewOrder && { borderWidth: 2, borderColor: colors.primary }
                      ]}
                      onPress={() => router.push(`/(delivery)/order/${order.id}` as any)}
                    >
                      <ResponsiveView style={styles.orderHeader}>
                        <ResponsiveView flexDirection="row" alignItems="center" flex={1}>
                          <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                            {order.order_number || `#${order.id.slice(-6).toUpperCase()}`}
                          </ResponsiveText>
                          {isNewOrder && (
                            <ResponsiveView 
                              style={[styles.newBadge, { backgroundColor: colors.primary }]}
                              marginLeft="xs"
                            >
                              <ResponsiveText size="xs" color={colors.textInverse} weight="bold">
                                NEW
                              </ResponsiveText>
                            </ResponsiveView>
                          )}
                        </ResponsiveView>
                        <ResponsiveView style={[styles.statusBadge, { backgroundColor: colors.info + '20' }]}>
                          <MaterialIcons name="schedule" size={16} color={colors.info} />
                          <ResponsiveView marginLeft="xs">
                            <ResponsiveText size="xs" color={colors.info} weight="medium">
                              AVAILABLE
                            </ResponsiveText>
                          </ResponsiveView>
                        </ResponsiveView>
                      </ResponsiveView>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        {order.customer?.full_name || 'Customer'}
                      </ResponsiveText>
                      <ResponsiveText size="sm" color={colors.textSecondary}>
                        ₱{order.total_amount?.toFixed(2) || '0.00'}
                      </ResponsiveText>
                      <ResponsiveText size="xs" color={colors.textSecondary}>
                        {formatDate(order.created_at)}
                      </ResponsiveText>
                      <ResponsiveView marginTop="sm">
                        {getOrderActions(order)}
                      </ResponsiveView>
                    </TouchableOpacity>
                  );
                })}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Assigned Orders */}
          {showAssignedOrders && assignedOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  My Orders
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {assignedOrders.length} orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.ordersList}>
                {assignedOrders.map((assignment) => (
                  <TouchableOpacity
                    key={assignment.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${assignment.order_id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {assignment.order?.order_number || `#${assignment.order_id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { 
                        backgroundColor: getStatusColor(assignment.status) + '20' 
                      }]}>
                        <MaterialIcons name={getStatusIcon(assignment.status) as any} size={16} color={getStatusColor(assignment.status)} />
                        <ResponsiveView marginLeft="xs">
                          <ResponsiveText size="xs" color={getStatusColor(assignment.status)} weight="medium">
                            {assignment.status?.toUpperCase()}
                          </ResponsiveText>
                        </ResponsiveView>
                      </ResponsiveView>
                    </ResponsiveView>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {(assignment.order as any)?.customer?.full_name || 'Customer'}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{assignment.order?.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      Assigned: {formatDate(assignment.assigned_at)}
                    </ResponsiveText>
                    <ResponsiveView marginTop="sm">
                      {getOrderActions(assignment.order, assignment)}
                    </ResponsiveView>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Recent Orders */}
          {showRecentOrders && recentOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  Recent Orders
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {recentOrders.length} orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.ordersList}>
                {recentOrders.slice(0, 5).map((assignment) => (
                  <TouchableOpacity
                    key={assignment.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${assignment.order_id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {assignment.order?.order_number || `#${assignment.order_id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { 
                        backgroundColor: getStatusColor(assignment.status) + '20' 
                      }]}>
                        <MaterialIcons name={getStatusIcon(assignment.status) as any} size={16} color={getStatusColor(assignment.status)} />
                        <ResponsiveView marginLeft="xs">
                          <ResponsiveText size="xs" color={getStatusColor(assignment.status)} weight="medium">
                            {assignment.status?.toUpperCase()}
                          </ResponsiveText>
                        </ResponsiveView>
                      </ResponsiveView>
                    </ResponsiveView>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {(assignment.order as any)?.customer?.full_name || 'Customer'}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{assignment.order?.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      {formatDate(assignment.assigned_at)}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Delivered Orders */}
          {showDeliveredOrders && deliveredOrders.length > 0 && (
            <ResponsiveView style={styles.section}>
              <ResponsiveView style={styles.sectionHeader}>
                <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                  Delivered Orders
                </ResponsiveText>
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  {deliveredOrders.length} orders
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView style={styles.ordersList}>
                {deliveredOrders.slice(0, 10).map((assignment) => (
                  <TouchableOpacity
                    key={assignment.id}
                    style={[styles.orderCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(delivery)/order/${assignment.order_id}` as any)}
                  >
                    <ResponsiveView style={styles.orderHeader}>
                      <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                        {assignment.order?.order_number || `#${assignment.order_id.slice(-6).toUpperCase()}`}
                      </ResponsiveText>
                      <ResponsiveView style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                        <MaterialIcons name="check-circle" size={16} color={colors.success} />
                        <ResponsiveView marginLeft="xs">
                          <ResponsiveText size="xs" color={colors.success} weight="medium">
                            DELIVERED
                          </ResponsiveText>
                        </ResponsiveView>
                      </ResponsiveView>
                    </ResponsiveView>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      {(assignment.order as any)?.customer?.full_name || 'Customer'}
                    </ResponsiveText>
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      ₱{assignment.order?.total_amount?.toFixed(2) || '0.00'}
                    </ResponsiveText>
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      Delivered: {formatDate(assignment.delivered_at || assignment.order?.actual_delivery_time || '')}
                    </ResponsiveText>
                  </TouchableOpacity>
                ))}
              </ResponsiveView>
            </ResponsiveView>
          )}

          {/* Empty State */}
          {availableOrders.length === 0 && assignedOrders.length === 0 && recentOrders.length === 0 && deliveredOrders.length === 0 && (
            <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <MaterialIcons name="assignment" size={48} color={colors.textSecondary} />
              <ResponsiveView marginTop="md">
                <ResponsiveText size="lg" color={colors.text} align="center">
                  No Orders Available
                </ResponsiveText>
              </ResponsiveView>
              <ResponsiveView marginTop="sm">
                <ResponsiveText size="md" color={colors.textSecondary} align="center">
                  There are no orders to manage at the moment.
                </ResponsiveText>
              </ResponsiveView>
              {error && (
                <ResponsiveView marginTop="sm">
                  <ResponsiveText size="sm" color={colors.error} align="center">
                    Error: {error}
                  </ResponsiveText>
                </ResponsiveView>
              )}
              <ResponsiveView marginTop="lg">
                <Button
                  title="Refresh"
                  onPress={handleRefresh}
                  variant="primary"
                  size="medium"
                />
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: ResponsiveSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
    paddingHorizontal: ResponsiveSpacing.sm,
  },
  ordersList: {
    gap: ResponsiveSpacing.sm,
  },
  orderCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  newBadge: {
    paddingHorizontal: ResponsiveSpacing.xs,
    paddingVertical: 2,
    borderRadius: ResponsiveBorderRadius.xs,
  },
  newIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.sm,
    borderWidth: 1,
  },
  emptyState: {
    padding: ResponsiveSpacing.xl,
    borderRadius: ResponsiveBorderRadius.lg,
    alignItems: 'center',
    ...Layout.shadows.sm,
  },
  debugCard: {
    padding: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.sm,
    marginBottom: ResponsiveSpacing.md,
    borderWidth: 1,
  },
});
