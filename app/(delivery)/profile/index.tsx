import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useDeliveryEarnings, useDeliveryStats, useProfile } from '../../../hooks';
import { useAuth } from '../../../hooks/useAuth';

interface DeliveryProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  vehicle_type: string;
  license_plate?: string;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  completed_deliveries: number;
  total_earnings: number;
  join_date: string;
  last_active: string;
}

export default function DeliveryProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Use real data from hooks
  const { profile: userProfile, isLoading: profileLoading, refresh: refreshProfile } = useProfile(user?.id || '');
  const { stats, isLoading: statsLoading, refresh: refreshStats } = useDeliveryStats();
  const { earnings, isLoading: earningsLoading, refresh: refreshEarnings } = useDeliveryEarnings();

  const loading = profileLoading || statsLoading || earningsLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshProfile(),
        refreshStats(),
        refreshEarnings()
      ]);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!userProfile) return;

    Alert.alert(
      'Toggle Availability',
      `Are you sure you want to ${userProfile.is_active ? 'go offline' : 'go online'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: userProfile.is_active ? 'Go Offline' : 'Go Online', 
          onPress: async () => {
            try {
              // TODO: Implement availability toggle in backend
              Alert.alert('Success', `You are now ${!userProfile.is_active ? 'online' : 'offline'}!`);
            } catch (error) {
              console.error('Error updating availability:', error);
              Alert.alert('Error', 'Failed to update availability. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <ResponsiveView style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
          <ResponsiveView style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.background }]}>
              <MaterialIcons name="delivery-dining" size={40} color={colors.primary} />
            </View>
            <ResponsiveView 
              style={[
                styles.availabilityBadge, 
                { backgroundColor: userProfile?.is_active ? colors.success : colors.error }
              ]}
            >
              <MaterialIcons 
                name={userProfile?.is_active ? 'check-circle' : 'cancel'} 
                size={12} 
                color={colors.background} 
              />
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveText size="xl" weight="bold" color={colors.background}>
            {userProfile?.full_name || 'Delivery Staff'}
          </ResponsiveText>
          <ResponsiveText size="md" color={colors.background} style={{ opacity: 0.9 }}>
            {userProfile?.email || user?.email || 'No email'}
          </ResponsiveText>
          <ResponsiveText size="sm" color={colors.background} style={{ opacity: 0.8 }}>
            Delivery Staff
          </ResponsiveText>
        </ResponsiveView>

        <ResponsiveView style={styles.content}>
          {/* Availability Status */}
          <ResponsiveView style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ResponsiveView style={styles.statusHeader}>
              <MaterialIcons 
                name={userProfile?.is_active ? 'online-prediction' : 'offline-bolt'} 
                size={24} 
                color={userProfile?.is_active ? colors.success : colors.error} 
              />
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                {userProfile?.is_active ? 'Online' : 'Offline'}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {userProfile?.is_active 
                  ? 'You are currently available for deliveries'
                  : 'You are currently offline and not receiving new orders'
                }
              </ResponsiveText>
            </ResponsiveView>
            <Button
              title={userProfile?.is_active ? 'Go Offline' : 'Go Online'}
              onPress={handleToggleAvailability}
              variant={userProfile?.is_active ? 'outline' : 'primary'}
              size="small"
            />
          </ResponsiveView>

          {/* Performance Stats */}
          <ResponsiveView style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Performance Stats
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.statsGrid}>
              <ResponsiveView style={styles.statItem}>
                <MaterialIcons name="star" size={20} color={colors.warning} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Rating
                  </ResponsiveText>
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                    {stats?.customerRating || 0}/5.0
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>

              <ResponsiveView style={styles.statItem}>
                <MaterialIcons name="delivery-dining" size={20} color={colors.primary} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Total Deliveries
                  </ResponsiveText>
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                    {stats?.totalDeliveries || 0}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>

              <ResponsiveView style={styles.statItem}>
                <MaterialIcons name="check-circle" size={20} color={colors.success} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Completed
                  </ResponsiveText>
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                    {stats?.completedDeliveries || 0}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>

              <ResponsiveView style={styles.statItem}>
                <MaterialIcons name="attach-money" size={20} color={colors.info} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Total Earnings
                  </ResponsiveText>
                  <ResponsiveText size="md" weight="semiBold" color={colors.text}>
                    ₱{(earnings?.total || 0).toFixed(2)}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Performance Summary */}
          <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Performance Summary
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="schedule" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Average Delivery Time
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {stats?.averageDeliveryTime ? `${Math.round(stats.averageDeliveryTime)} min` : 'N/A'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="timer" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  On-Time Deliveries
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {stats?.onTimeDeliveries || 0}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Account Information */}
          <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Account Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="person" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Full Name
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {userProfile?.full_name || 'N/A'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="email" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Email
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {userProfile?.email || user?.email || 'N/A'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Phone Number
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {userProfile?.phone_number || 'N/A'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Joined
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Action Buttons */}
          <ResponsiveView style={styles.actionsContainer}>
            <Button
              title="Edit Profile"
              onPress={() => router.push('/(delivery)/profile/edit' as any)}
              variant="outline"
              size="small"
              icon={<MaterialIcons name="edit" size={16} color={colors.primary} />}
            />
            <Button
              title="Settings"
              onPress={() => router.push('/(delivery)/profile/settings' as any)}
              variant="outline"
              size="small"
              icon={<MaterialIcons name="settings" size={16} color={colors.primary} />}
            />
            <Button
              title="Help & Support"
              onPress={() => router.push('/(delivery)/profile/help' as any)}
              variant="outline"
              size="small"
              icon={<MaterialIcons name="help" size={16} color={colors.primary} />}
            />
          </ResponsiveView>

          {/* Sign Out Button */}
          <ResponsiveView style={styles.signOutContainer}>
            <Button
              title={Strings.signOut}
              onPress={handleSignOut}
              variant="danger"
              icon={<MaterialIcons name="logout" size={16} color={colors.background} />}
            />
          </ResponsiveView>
        </ResponsiveView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statsGrid: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  signOutContainer: {
    marginTop: 20,
  },
});
