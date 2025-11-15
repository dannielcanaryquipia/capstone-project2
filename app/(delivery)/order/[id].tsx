import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
import Button from '../../../components/ui/Button';
import { ImageUploadProcessingOverlay } from '../../../components/ui/ImageUploadProcessingOverlay';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing } from '../../../constants/Responsive';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useResponsive } from '../../../hooks/useResponsive';
import { supabase } from '../../../lib/supabase';
import { OrderService } from '../../../services/order.service';
import global from '../../../styles/global';
import { Order } from '../../../types/order.types';

export default function OrderDetailsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { show, confirm, success, error: showError } = useAlert();
  const { isSmallDevice } = useResponsive();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [riderId, setRiderId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  // Get rider ID
  useEffect(() => {
    const getRiderId = async () => {
      if (!user?.id) return;
      try {
        const { data: rider } = await supabase
          .from('riders')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (rider?.id) setRiderId(rider.id);
      } catch (e) {
        console.error('Error getting rider ID:', e);
      }
    };
    getRiderId();
  }, [user?.id]);

  // Real-time subscription for order status updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`order-${id}-details`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('Order status updated in real-time:', payload.new);
          // Reload order details when status changes
          loadOrderDetails();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `order_id=eq.${id}`,
        },
        (payload) => {
          console.log('Delivery assignment updated:', payload);
          // Reload order details when assignment changes
          loadOrderDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getOrderById(id!);
      console.log('Order data loaded:', JSON.stringify(orderData, null, 2));
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
      showError('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCODPayment = async () => {
    if (!order || !user?.id) return;

    console.log('Order status for COD verification:', order.status);
    console.log('Order payment method:', order.payment_method);
    console.log('Order payment status:', order.payment_status);

    confirm(
      'Verify COD Payment',
      `Confirm that you have received ₱${order.total_amount.toFixed(2)} in cash from the customer for this order.`,
      async () => {
        try {
          setActionLoading(true);
          await OrderService.verifyCODPayment(order.id, user.id);
          success(
            'Payment Verified! 💰', 
            'COD payment verified successfully! Customer has been notified. You can now proceed to mark the order as delivered.',
            [{ text: 'OK', onPress: () => loadOrderDetails() }]
          );
        } catch (error: any) {
          console.error('Error verifying COD payment:', error);
          showError('Error', error.message || 'Failed to verify payment');
        } finally {
          setActionLoading(false);
        }
      },
      undefined,
      'Verify Payment',
      'Cancel'
    );
  };

  const handleUploadProof = async () => {
    if (!order || !user?.id) return;

    const handleAddPhoto = async () => {
      try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          showError('Permission Required', 'Camera permission is required to take photos.');
          return;
        }

        setUploadingProof(true);
        try {
          const res = await ImagePicker.launchCameraAsync({ 
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            quality: 0.7,
            allowsEditing: false,
          });
          
          if (res.canceled) {
            setUploadingProof(false);
            return;
          }

          if (res.assets[0]) {
            const uri = res.assets[0].uri;
            // Show overlay when starting upload
            setShowUploadOverlay(true);
            try {
              const result = await OrderService.uploadDeliveryProof(order.id, user.id, uri);
              if (result.success) {
                success('Success! 📸', result.message, [{ text: 'OK', onPress: () => loadOrderDetails() }]);
              } else {
                showError('Error', result.message);
              }
            } catch (uploadError: any) {
              console.error('Error uploading proof:', uploadError);
              showError('Error', uploadError.message || 'Failed to upload proof. Please try again.');
            } finally {
              setShowUploadOverlay(false);
            }
          }
        } finally {
          setUploadingProof(false);
        }
      } catch (error: any) {
        console.error('Error taking photo:', error);
        showError('Error', error.message || 'Failed to take photo. Please try again.');
        setUploadingProof(false);
        setShowUploadOverlay(false);
      }
    };

    const handleChooseFromGallery = async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          showError('Permission Required', 'Photo library permission is required to select images.');
          return;
        }

        setUploadingProof(true);
        try {
          const res = await ImagePicker.launchImageLibraryAsync({ 
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            quality: 0.7,
            allowsEditing: false,
          });
          
          if (res.canceled) {
            setUploadingProof(false);
            return;
          }

          if (res.assets[0]) {
            const uri = res.assets[0].uri;
            // Show overlay when starting upload
            setShowUploadOverlay(true);
            try {
              const result = await OrderService.uploadDeliveryProof(order.id, user.id, uri);
              if (result.success) {
                success('Success! 📸', result.message, [{ text: 'OK', onPress: () => loadOrderDetails() }]);
              } else {
                showError('Error', result.message);
              }
            } catch (uploadError: any) {
              console.error('Error uploading proof:', uploadError);
              showError('Error', uploadError.message || 'Failed to upload proof. Please try again.');
            } finally {
              setShowUploadOverlay(false);
            }
          }
        } finally {
          setUploadingProof(false);
        }
      } catch (error: any) {
        console.error('Error selecting photo:', error);
        showError('Error', error.message || 'Failed to select photo. Please try again.');
        setUploadingProof(false);
        setShowUploadOverlay(false);
      }
    };

    show(
      'Upload Proof of Delivery',
      'Please add a photo as proof of delivery.',
      [
        { 
          text: 'Take Photo', 
          style: 'default',
          onPress: handleAddPhoto
        },
        { 
          text: 'Choose from Gallery', 
          style: 'default',
          onPress: handleChooseFromGallery
        },
        { 
          text: 'Cancel', 
          style: 'cancel'
        }
      ]
    );
  };

  const handleMarkDelivered = async () => {
    if (!order || !user?.id) return;

    const hasProof = !!(order as any).proof_of_delivery_url;

    // If no proof exists, prompt to upload first (similar to GCash payment proof)
    if (!hasProof) {
      const handleAddPhoto = async () => {
        try {
          const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
          if (permissionResult.granted === false) {
            showError('Permission Required', 'Camera permission is required to take photos.');
            return;
          }

          setActionLoading(true);
          try {
            const res = await ImagePicker.launchCameraAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.7,
              allowsEditing: false,
            });
            
            if (res.canceled) {
              setActionLoading(false);
              return;
            }

            if (res.assets[0]?.uri) {
              const uri = res.assets[0].uri;
              console.log('📸 Image selected from camera, starting upload and delivery process...', { uri: uri.substring(0, 50) + '...' });
              // Show overlay when starting upload
              setShowUploadOverlay(true);
              try {
                // Mark as delivered with proof image
                const result = await OrderService.markOrderDelivered(order.id, user.id, uri);
                if (result.success) {
                  success(
                    'Success! ✅', 
                    result.message,
                    [{ text: 'OK', onPress: () => router.back() }]
                  );
                } else {
                  showError('Error', result.message);
                }
              } catch (deliveryError: any) {
                console.error('Error marking order as delivered:', deliveryError);
                showError('Error', deliveryError.message || 'Failed to mark order as delivered. Please try again.');
              } finally {
                setShowUploadOverlay(false);
              }
            } else {
              console.warn('No image URI found in camera result');
              showError('Error', 'Failed to get image. Please try again.');
            }
          } finally {
            setActionLoading(false);
          }
        } catch (error: any) {
          console.error('Error taking photo:', error);
          showError('Error', error.message || 'Failed to take photo. Please try again.');
          setActionLoading(false);
          setShowUploadOverlay(false);
        }
      };

      const handleChooseFromGallery = async () => {
        try {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permissionResult.granted === false) {
            showError('Permission Required', 'Photo library permission is required to select images.');
            return;
          }

          setActionLoading(true);
          try {
            const res = await ImagePicker.launchImageLibraryAsync({ 
              mediaTypes: ImagePicker.MediaTypeOptions.Images, 
              quality: 0.7,
              allowsEditing: false,
            });
            
            if (res.canceled) {
              setActionLoading(false);
              return;
            }

            if (res.assets[0]?.uri) {
              const uri = res.assets[0].uri;
              console.log('📸 Image selected from gallery, starting upload and delivery process...', { uri: uri.substring(0, 50) + '...' });
              // Show overlay when starting upload
              setShowUploadOverlay(true);
              try {
                // Mark as delivered with proof image
                const result = await OrderService.markOrderDelivered(order.id, user.id, uri);
                if (result.success) {
                  success(
                    'Success! ✅', 
                    result.message,
                    [{ text: 'OK', onPress: () => router.back() }]
                  );
                } else {
                  showError('Error', result.message);
                }
              } catch (deliveryError: any) {
                console.error('Error marking order as delivered:', deliveryError);
                showError('Error', deliveryError.message || 'Failed to mark order as delivered. Please try again.');
              } finally {
                setShowUploadOverlay(false);
              }
            } else {
              console.warn('No image URI found in gallery selection');
              showError('Error', 'Failed to get image. Please try again.');
            }
          } finally {
            setActionLoading(false);
          }
        } catch (error: any) {
          console.error('Error selecting photo:', error);
          showError('Error', error.message || 'Failed to select photo. Please try again.');
          setActionLoading(false);
          setShowUploadOverlay(false);
        }
      };

      // Show modal to upload proof (similar to GCash payment proof modal)
      show(
        'Proof of Delivery Required',
        'Please upload a photo as proof of delivery before marking the order as delivered.',
        [
          { 
            text: 'Take Photo', 
            style: 'default',
            onPress: handleAddPhoto
          },
          { 
            text: 'Choose from Gallery', 
            style: 'default',
            onPress: handleChooseFromGallery
          },
          { 
            text: 'Cancel', 
            style: 'cancel'
          }
        ]
      );
      return;
    }

    // If proof already exists, proceed with confirmation
    confirm(
      'Mark as Delivered',
      'Are you sure you want to mark this order as delivered? This action cannot be undone.',
      async () => {
        try {
          setActionLoading(true);
          // Use existing proof
          const result = await OrderService.markOrderDelivered(order.id, user.id, undefined);
          if (result.success) {
            success(
              'Success! ✅', 
              result.message,
              [{ text: 'OK', onPress: () => router.back() }]
            );
          } else {
            showError('Error', result.message);
          }
        } catch (error: any) {
          console.error('Error marking order as delivered:', error);
          showError('Error', error.message || 'Failed to mark order as delivered');
        } finally {
          setActionLoading(false);
        }
      },
      undefined,
      'Mark as Delivered',
      'Cancel'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'preparing': return colors.info;
      case 'ready_for_pickup': return colors.warning;
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'preparing': return 'restaurant';
      case 'ready_for_pickup': return 'restaurant';
      case 'out_for_delivery': return 'local-shipping';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const formatStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'preparing': 'PREPARING',
      'ready_for_pickup': isSmallDevice ? 'READY' : 'READY FOR PICKUP',
      'out_for_delivery': 'OUT FOR DELIVERY',
      'delivered': 'DELIVERED',
      'cancelled': 'CANCELLED',
    };
    return statusMap[status] || status.replace('_', ' ').toUpperCase();
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'verified': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionButtons = () => {
    if (!order || !user?.id) return null;

    const isCOD = order.payment_method?.toLowerCase() === 'cod';
    const isGCash = order.payment_method?.toLowerCase() === 'gcash';
    const paymentVerified = order.payment_status === 'verified' || (order as any).payment_verified;
    const isReadyForPickup = order.status === 'ready_for_pickup';
    const isOutForDelivery = order.status === 'out_for_delivery';
    const isDelivered = order.status === 'delivered';
    const hasProof = !!(order as any).proof_of_delivery_url;

    // Get assignment info if available
    const deliveryAssignments = (order as any).delivery_assignments || [];
    const assignment = deliveryAssignments[0];
    const assignmentStatus = assignment?.status;
    const isAssignedToMe = assignment?.rider_id === riderId;
    const buttons: React.ReactNode[] = [];

    // Order already delivered
    if (isDelivered) {
      return (
        <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
          <ResponsiveView marginLeft="sm">
            <ResponsiveText size="sm" color={colors.success} weight="medium">
              Order has been delivered successfully
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      );
    }

    // GCash orders need admin verification first
    if (isGCash && !paymentVerified && isOutForDelivery) {
      return (
        <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
          <MaterialIcons name="info" size={20} color={colors.warning} />
          <ResponsiveView marginLeft="sm">
            <ResponsiveText size="sm" color={colors.warning} weight="medium">
              Waiting for admin to verify GCash payment before delivery
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      );
    }

    // Handle ready_for_pickup orders - show "Mark as Picked Up" button
    // Only show if order is assigned to this rider and assignment status is "Assigned"
    if (isReadyForPickup && assignment && isAssignedToMe && (assignmentStatus === 'Assigned' || !assignmentStatus)) {
      return (
        <Button
          title="Mark as Picked Up"
          onPress={async () => {
            try {
              setActionLoading(true);
              const { data: rider } = await supabase
                .from('riders')
                .select('id')
                .eq('user_id', user.id)
                .single();
              if (!rider || !(rider as any).id) throw new Error('Rider profile not found');
              
              const { RiderService } = await import('../../../services/rider.service');
              await RiderService.markOrderPickedUp(order.id, (rider as any).id);
              await loadOrderDetails();
              success('Success! 📦', 'Order marked as picked up');
            } catch (error: any) {
              console.error('Error marking order as picked up:', error);
              showError('Error', error.message || 'Failed to mark as picked up');
            } finally {
              setActionLoading(false);
            }
          }}
          loading={actionLoading}
          variant="primary"
          size="large"
          icon={<MaterialIcons name="local-shipping" size={20} color="white" />}
        />
      );
    }

    // Only show buttons for orders that are out for delivery
    if (!isOutForDelivery || isDelivered) {
      return null;
    }

    // Button 1: Verify COD Payment (only for COD orders when payment not verified)
    if (isCOD && !paymentVerified) {
      buttons.push(
        <Button
          key="verify-cod"
          title="Verify COD Payment"
          onPress={handleVerifyCODPayment}
          loading={actionLoading}
          variant="primary"
          size="large"
          icon={<MaterialIcons name="payment" size={20} color="white" />}
        />
      );
    }

    // Button 2: Upload Proof of Delivery (when payment is verified or not COD)
    if (paymentVerified || !isCOD) {
      buttons.push(
        <Button
          key="upload-proof"
          title={hasProof ? "Update Proof of Delivery" : "Upload Proof of Delivery"}
          onPress={handleUploadProof}
          loading={uploadingProof}
          variant="outline"
          size="large"
          icon={<MaterialIcons name="camera-alt" size={20} color={colors.primary} />}
        />
      );
    }

    // Button 3: Mark as Delivered (at bottom, only when payment verified)
    // Show this button only after payment is verified (for COD) or for non-COD orders
    if (paymentVerified || !isCOD) {
      buttons.push(
        <Button
          key="mark-delivered"
          title="Mark as Delivered"
          onPress={handleMarkDelivered}
          loading={actionLoading}
          variant="primary"
          size="large"
          icon={<MaterialIcons name="check-circle" size={20} color="white" />}
        />
      );
    }

    if (buttons.length === 0) return null;

    return (
      <ResponsiveView style={styles.actionButtonsContainer}>
        {buttons.map((button, index) => (
          <ResponsiveView key={index} marginTop={index > 0 ? "md" : undefined}>
            {button}
          </ResponsiveView>
        ))}
      </ResponsiveView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <LoadingState 
          message="Loading order details..." 
          fullScreen 
        />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <MaterialIcons name="error" size={48} color={colors.error} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" color={colors.text} align="center">
              Order not found
            </ResponsiveText>
          </ResponsiveView>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.backButton}
          />
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <ResponsiveView padding="lg">
          {/* Header */}
          <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
            <Button
              title=""
              onPress={() => router.back()}
              variant="text"
              icon={<MaterialIcons name="arrow-back" size={24} color={colors.primary} />}
            />
            <ResponsiveView style={styles.headerContent}>
              <ResponsiveText size="xl" weight="bold" color={colors.text}>
                Order #{order.order_number || order.id.slice(-6).toUpperCase()}
              </ResponsiveText>
              <ResponsiveView style={styles.statusRow} marginTop="sm">
                <ResponsiveView style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(order.status) + '20' 
                }]}>
                  <MaterialIcons 
                    name={getStatusIcon(order.status) as any} 
                    size={isSmallDevice ? 14 : 16} 
                    color={getStatusColor(order.status)} 
                  />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText 
                    size={isSmallDevice ? "xs" : "sm"} 
                    color={getStatusColor(order.status)}
                    weight="semiBold"
                    numberOfLines={1}
                    style={styles.statusText}
                  >
                    {formatStatusText(order.status)}
                  </ResponsiveText>
                </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Order Info */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Order Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Order Date:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {formatDate(order.created_at)}
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Payment Method:
              </ResponsiveText>
              <ResponsiveView style={styles.paymentMethod}>
                <MaterialIcons 
                  name={order.payment_method?.toLowerCase() === 'gcash' ? 'account-balance-wallet' : 'money'} 
                  size={16} 
                  color={colors.primary} 
                />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText size="md" color={colors.text} weight="medium">
                    {order.payment_method?.toUpperCase()}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Payment Status:
              </ResponsiveText>
              <ResponsiveView style={[styles.paymentStatus, { 
                backgroundColor: getPaymentStatusColor(order.payment_status) + '20' 
              }]}>
                <MaterialIcons 
                  name={order.payment_status === 'verified' ? 'check-circle' : order.payment_status === 'pending' ? 'schedule' : 'error'} 
                  size={16} 
                  color={getPaymentStatusColor(order.payment_status)} 
                />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText 
                    size="sm" 
                    color={getPaymentStatusColor(order.payment_status)}
                    weight="semiBold"
                  >
                    {order.payment_status?.toUpperCase()}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            {(order as any).payment_verified_by && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Verified By:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  Delivery Partner
                </ResponsiveText>
              </ResponsiveView>
            )}

            {(order as any).payment_verified_at && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Verified At:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {formatDate((order as any).payment_verified_at)}
                </ResponsiveText>
              </ResponsiveView>
            )}

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Total Amount:
              </ResponsiveText>
              <ResponsiveText size="lg" color={colors.primary} weight="bold">
                ₱{order.total_amount.toFixed(2)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Customer Info */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Customer Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Name:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {(order as any).customer?.full_name || (order as any).user?.full_name || 'Unknown'}
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Phone:
              </ResponsiveText>
              <ResponsiveText size="md" color={colors.text} weight="medium">
                {(order as any).customer?.phone_number || (order as any).user?.phone_number || 'Not provided'}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>

          {/* Delivery Address */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Delivery Address
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.addressContainer}>
              <MaterialIcons name="location-on" size={20} color={colors.primary} />
              <ResponsiveView style={styles.addressText} marginLeft="sm">
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {(order as any).delivery_address?.full_address || (order as any).delivery_address?.address || 'Address not available'}
                </ResponsiveText>
                {(order as any).delivery_address?.label && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      Label: {(order as any).delivery_address.label}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
                {(order as any).delivery_address?.city && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="sm" color={colors.textSecondary}>
                      City: {(order as any).delivery_address.city}
                    </ResponsiveText>
                  </ResponsiveView>
                )}
              </ResponsiveView>
            </ResponsiveView>

            {(order as any).order_notes && (
              <ResponsiveView style={styles.notesContainer} marginTop="md">
                <ResponsiveText size="sm" color={colors.textSecondary} weight="medium">
                  Special Instructions:
                </ResponsiveText>
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.text}>
                    {(order as any).order_notes}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Delivery Information */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Delivery Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoRow}>
              <ResponsiveText size="md" color={colors.textSecondary}>
                Delivery Status:
              </ResponsiveText>
              <ResponsiveView style={[styles.deliveryStatus, { 
                backgroundColor: getStatusColor(order.status) + '20' 
              }]}>
                <MaterialIcons 
                  name={getStatusIcon(order.status) as any} 
                  size={isSmallDevice ? 14 : 16} 
                  color={getStatusColor(order.status)} 
                />
                <ResponsiveView marginLeft="xs">
                  <ResponsiveText 
                    size={isSmallDevice ? "xs" : "sm"} 
                    color={getStatusColor(order.status)}
                    weight="semiBold"
                    numberOfLines={1}
                    style={styles.statusText}
                  >
                    {formatStatusText(order.status)}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            {order.actual_delivery_time && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Delivered At:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {formatDate(order.actual_delivery_time)}
                </ResponsiveText>
              </ResponsiveView>
            )}

            {order.estimated_delivery_time && (
              <ResponsiveView style={styles.infoRow}>
                <ResponsiveText size="md" color={colors.textSecondary}>
                  Estimated Delivery:
                </ResponsiveText>
                <ResponsiveText size="md" color={colors.text} weight="medium">
                  {formatDate(order.estimated_delivery_time)}
                </ResponsiveText>
              </ResponsiveView>
            )}
          </ResponsiveView>

          {/* Order Items */}
          <ResponsiveView style={[styles.section, { backgroundColor: colors.surface }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Order Items ({order.items?.length || 0})
              </ResponsiveText>
            </ResponsiveView>
            
            {order.items?.map((item, index) => (
              <ResponsiveView key={item.id || index} style={styles.orderItem}>
                <ResponsiveView style={styles.itemInfo}>
                  <ResponsiveText size="md" color={colors.text} weight="medium">
                    {item.product_name}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Qty: {item.quantity} × ₱{item.unit_price.toFixed(2)}
                  </ResponsiveText>
                  {item.special_instructions && (
                  <ResponsiveView marginTop="xs">
                    <ResponsiveText size="xs" color={colors.textSecondary}>
                      Note: {item.special_instructions}
                    </ResponsiveText>
                  </ResponsiveView>
                  )}
                </ResponsiveView>
                <ResponsiveText size="md" color={colors.primary} weight="semiBold">
                  ₱{item.total_price.toFixed(2)}
                </ResponsiveText>
              </ResponsiveView>
            ))}
          </ResponsiveView>

          {/* Action Buttons */}
          {getActionButtons() && (
            <ResponsiveView style={styles.actionContainer} marginTop="lg">
              {getActionButtons()}
            </ResponsiveView>
          )}
        </ResponsiveView>
      </ScrollView>
      
      {/* Image Upload Processing Overlay - Shows during proof upload */}
      <ImageUploadProcessingOverlay 
        visible={showUploadOverlay}
        message="Uploading proof of delivery Please wait for a while"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  headerContent: {
    flex: 1,
    marginLeft: ResponsiveSpacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
    maxWidth: '100%',
    flexShrink: 1,
  },
  section: {
    padding: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
    ...Layout.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
    maxWidth: '100%',
    flexShrink: 1,
  },
  statusText: {
    flexShrink: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    marginTop: ResponsiveSpacing.md,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
  },
  notesContainer: {
    padding: ResponsiveSpacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: ResponsiveBorderRadius.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: ResponsiveSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemInfo: {
    flex: 1,
    marginRight: ResponsiveSpacing.sm,
  },
  actionContainer: {
    paddingBottom: ResponsiveSpacing.xl,
  },
  actionButtonsContainer: {
    gap: ResponsiveSpacing.md,
  },
  backButton: {
    marginTop: ResponsiveSpacing.md,
  },
});
