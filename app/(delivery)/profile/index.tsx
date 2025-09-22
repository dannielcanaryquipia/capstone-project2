import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';

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
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockProfile: DeliveryProfile = {
        id: user?.id || 'delivery1',
        full_name: 'Mike Johnson',
        email: 'mike.delivery@example.com',
        phone_number: '+1234567890',
        vehicle_type: 'Motorcycle',
        license_plate: 'ABC-123',
        is_available: true,
        rating: 4.8,
        total_deliveries: 156,
        completed_deliveries: 148,
        total_earnings: 1250.75,
        join_date: '2024-01-01T00:00:00Z',
        last_active: '2024-01-15T14:30:00Z',
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;

    Alert.alert(
      'Toggle Availability',
      `Are you sure you want to ${profile.is_available ? 'go offline' : 'go online'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: profile.is_available ? 'Go Offline' : 'Go Online', 
          onPress: async () => {
            try {
              setProfile(prev => prev ? { ...prev, is_available: !prev.is_available } : null);
              Alert.alert('Success', `You are now ${!profile.is_available ? 'online' : 'offline'}!`);
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
                { backgroundColor: profile?.is_available ? colors.success : colors.error }
              ]}
            >
              <MaterialIcons 
                name={profile?.is_available ? 'check-circle' : 'cancel'} 
                size={12} 
                color={colors.background} 
              />
            </ResponsiveView>
          </ResponsiveView>
          
          <ResponsiveText size="xl" weight="bold" color={colors.background}>
            {profile?.full_name}
          </ResponsiveText>
          <ResponsiveText size="md" color={colors.background} style={{ opacity: 0.9 }}>
            {profile?.email}
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
                name={profile?.is_available ? 'online-prediction' : 'offline-bolt'} 
                size={24} 
                color={profile?.is_available ? colors.success : colors.error} 
              />
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                {profile?.is_available ? 'Online' : 'Offline'}
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {profile?.is_available 
                  ? 'You are currently available for deliveries'
                  : 'You are currently offline and not receiving new orders'
                }
              </ResponsiveText>
            </ResponsiveView>
            <Button
              title={profile?.is_available ? 'Go Offline' : 'Go Online'}
              onPress={handleToggleAvailability}
              variant={profile?.is_available ? 'outline' : 'primary'}
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
                    {profile?.rating}/5.0
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
                    {profile?.total_deliveries}
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
                    {profile?.completed_deliveries}
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
                    ₱{profile?.total_earnings.toFixed(2)}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Vehicle Information */}
          <ResponsiveView style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Vehicle Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={styles.infoItem}>
              <MaterialIcons name="two-wheeler" size={20} color={colors.textSecondary} />
              <ResponsiveView marginLeft="sm">
                <ResponsiveText size="sm" color={colors.textSecondary}>
                  Vehicle Type
                </ResponsiveText>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {profile?.vehicle_type}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>

            {profile?.license_plate && (
              <ResponsiveView style={styles.infoItem}>
                <MaterialIcons name="confirmation-number" size={20} color={colors.textSecondary} />
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    License Plate
                  </ResponsiveText>
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    {profile.license_plate}
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            )}
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
                  {profile?.full_name}
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
                  {profile?.email}
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
                  {profile?.phone_number}
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
                  {profile ? formatDate(profile.join_date) : 'N/A'}
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
