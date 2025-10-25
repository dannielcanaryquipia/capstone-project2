import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../../components/ui/AlertProvider';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import Strings from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { useAvatar } from '../../../hooks/useAvatar';
import { useRiderProfile } from '../../../hooks/useRiderProfile';
import global from '../../../styles/global';

interface ProfileActionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  showChevron?: boolean;
  variant?: 'default' | 'danger';
}

export default function RiderProfileScreen() {
  const { colors } = useTheme();
  const { success: showSuccess, error: showError, confirm, confirmDestructive, info } = useAlert();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, stats, isLoading, error, toggleAvailability, updateProfile, refresh, refreshStats } = useRiderProfile();
  const { localAvatar, isLoading: isUploadingAvatar, saveAvatar, removeAvatar } = useAvatar();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to open Kitchen One website
  const openWebsite = async () => {
    const url = 'https://kitchenone.com'; // Replace with your actual website URL
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showError('Error', 'Cannot open website. Please check your internet connection.');
      }
    } catch (error) {
      showError('Error', 'Failed to open website. Please try again.');
    }
  };

  // Ensure stats are loaded when component mounts
  useEffect(() => {
    if (profile?.id && !isLoading) {
      console.log('Profile page: Profile loaded, refreshing stats...');
      refreshStats();
    }
  }, [profile?.id, isLoading, refreshStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleEditPress = () => {
    setEditForm({
      fullName: profile?.profile?.full_name || '',
      phoneNumber: profile?.profile?.phone_number || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      showError('Error', 'Full name is required');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        full_name: editForm.fullName.trim(),
        phone_number: editForm.phoneNumber.trim() || undefined,
      });
      // Immediately refresh profile data and close modal for smooth UX
      await refresh();
      setShowEditModal(false);
      showSuccess('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
      showError('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditForm({
      fullName: '',
      phoneNumber: '',
    });
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Change Avatar',
      'Choose how you want to update your profile picture',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Library', onPress: () => pickImage('library') },
        { text: 'Remove Avatar', onPress: () => removeAvatarHandler(), style: 'destructive' },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let result;
      
      if (source === 'camera') {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Photo library permission is required to select images.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    const success = await saveAvatar(imageUri);
    if (success) {
      showSuccess('Success', 'Profile picture updated successfully');
    } else {
      showError('Error', 'Failed to save profile picture. Please try again.');
    }
  };

  const removeAvatarHandler = async () => {
    const success = await removeAvatar();
    if (success) {
      showSuccess('Success', 'Profile picture removed successfully');
    } else {
      showError('Error', 'Failed to remove profile picture. Please try again.');
    }
  };

  const handleSignOut = () => {
    confirmDestructive(
      Strings.signOut,
      Strings.confirmLogout,
      async () => {
        try {
          await signOut();
          router.replace('/(auth)/sign-in');
        } catch (error) {
          showError('Error', 'Failed to sign out. Please try again.');
        }
      },
      undefined,
      Strings.signOut,
      Strings.cancel
    );
  };

  const formatMemberSince = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const profileActions: ProfileActionItem[] = [
    {
      id: 'orders',
      title: 'Delivery Orders',
      subtitle: 'View your assigned and completed orders',
      icon: 'local-shipping',
      onPress: () => router.push('/(delivery)/orders'),
      showChevron: true,
    },
    {
      id: 'earnings',
      title: 'Earnings',
      subtitle: 'View your delivery earnings and statistics',
      icon: 'attach-money',
      onPress: () => router.push('/(delivery)/orders/earnings'),
      showChevron: true,
    },
    {
      id: 'settings',
      title: Strings.settings,
      subtitle: 'App preferences and notifications',
      icon: 'settings',
      onPress: () => {
        // TODO: Add settings page for riders
        info('Settings', 'Rider settings coming soon!');
      },
      showChevron: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-outline',
      onPress: () => {
        // TODO: Add help page for riders
        info('Help & Support', 'Rider support coming soon!');
      },
      showChevron: true,
    },
    {
      id: 'about',
      title: `About ${Strings.appName}`,
      subtitle: 'Learn more about our app',
      icon: 'info-outline',
      onPress: () => {
        info(
          `About ${Strings.appName}`,
          `${Strings.appName} is a modern food delivery app that brings delicious meals right to your doorstep. We are committed to providing the best dining experience with fresh ingredients and excellent service.\n\nVersion 1.0.0`,
          [
            {
              text: 'Visit Website',
              onPress: openWebsite,
              style: 'default'
            },
            {
              text: 'Close',
              onPress: () => {},
              style: 'cancel'
            }
          ]
        );
      },
      showChevron: true,
    },
  ];

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to update availability');
    }
  };

  if (isLoading && !profile) {
    return (
      <View style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
          </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={[styles.center, { paddingTop: insets.top }]} padding="lg">
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
        <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.error} align="center">
              Failed to load profile
          </ResponsiveText>
        </ResponsiveView>
        <ResponsiveView marginTop="sm">
          <ResponsiveText size="md" color={colors.textSecondary} align="center">
            {error}
          </ResponsiveText>
        </ResponsiveView>
          <Button
            title="Try Again"
            onPress={refresh}
            variant="primary"
            size="medium"
            style={styles.retryButton}
          />
        </ResponsiveView>
      </View>
    );
  }

  return (
    <View style={[global.screen, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <ResponsiveView padding="lg">
          {/* Profile Header */}
          <ResponsiveView style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleAvatarPress}
              disabled={isUploadingAvatar}
              activeOpacity={0.7}
            >
              {localAvatar ? (
                <Image source={{ uri: localAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="person" size={48} color={colors.themedText} />
                </View>
              )}
              {isUploadingAvatar && (
                <ResponsiveView style={[styles.avatarOverlay, { backgroundColor: colors.background + '80' }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
          </ResponsiveView>
              )}
              <ResponsiveView style={[styles.avatarEditIcon, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="camera-alt" size={16} color={colors.textInverse} />
              </ResponsiveView>
            </TouchableOpacity>
            
            <ResponsiveView style={styles.userInfo}>
              <ResponsiveText size="xl" weight="bold" color={colors.themedText}>
                  {profile?.profile?.full_name || 'Rider'}
                </ResponsiveText>
              <ResponsiveView marginTop="xs">
                <ResponsiveText size="md" color={colors.textSecondary}>
                  {user?.email || 'user@example.com'}
                </ResponsiveText>
              </ResponsiveView>
              {profile?.created_at && (
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textTertiary}>
                    Member since {formatMemberSince(profile.created_at)}
                  </ResponsiveText>
                </ResponsiveView>
              )}
                <ResponsiveView style={styles.availabilityContainer}>
                  <ResponsiveView style={[
                    styles.availabilityBadge, 
                    { backgroundColor: profile?.is_available ? colors.success + '20' : colors.error + '20' }
                  ]}>
                    <MaterialIcons 
                      name={profile?.is_available ? 'check-circle' : 'pause-circle'} 
                      size={16} 
                      color={profile?.is_available ? colors.success : colors.error} 
                    />
                    <ResponsiveView marginLeft="xs">
                      <ResponsiveText 
                        size="sm" 
                        color={profile?.is_available ? colors.success : colors.error} 
                        weight="medium"
                      >
                        {profile?.is_available ? 'Available' : 'Unavailable'}
                      </ResponsiveText>
                    </ResponsiveView>
                  </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.surfaceVariant }]}
              onPress={handleEditPress}
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={24} color={colors.themedText} />
            </TouchableOpacity>
          </ResponsiveView>

          {/* Account Information Section */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Account Information
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={[styles.infoCard, { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              ...Layout.shadows.sm
            }]}>
              <ResponsiveView style={[styles.infoRow]}>
                <ResponsiveView style={styles.infoLabel}>
                  <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name="person" size={20} color={colors.themedText} />
                  </ResponsiveView>
                  <ResponsiveView marginLeft="sm">
                    <ResponsiveText size="md" color={colors.textSecondary}>
                      Full Name
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveText size="md" weight="medium" color={colors.themedText}>
                  {profile?.profile?.full_name || 'Not provided'}
                </ResponsiveText>
              </ResponsiveView>

              <ResponsiveView style={[styles.infoRow]}>
                <ResponsiveView style={styles.infoLabel}>
                  <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name="email" size={20} color={colors.themedText} />
                  </ResponsiveView>
                  <ResponsiveView marginLeft="sm">
                    <ResponsiveText size="md" color={colors.textSecondary}>
                      Email
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {user?.email || 'Not provided'}
                </ResponsiveText>
              </ResponsiveView>

              <ResponsiveView style={styles.infoRow}>
                <ResponsiveView style={styles.infoLabel}>
                  <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name="phone" size={20} color={colors.themedText} />
                  </ResponsiveView>
                  <ResponsiveView marginLeft="sm">
                    <ResponsiveText size="md" color={colors.textSecondary}>
                      Phone Number
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {profile?.profile?.phone_number || 'Not provided'}
                </ResponsiveText>
              </ResponsiveView>

              <ResponsiveView style={styles.infoRow}>
                <ResponsiveView style={styles.infoLabel}>
                  <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialIcons name="local-shipping" size={20} color={colors.themedText} />
                  </ResponsiveView>
                  <ResponsiveView marginLeft="sm">
                    <ResponsiveText size="md" color={colors.textSecondary}>
                      Vehicle Number
                    </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
                <ResponsiveText size="md" weight="medium" color={colors.text}>
                  {profile?.vehicle_number || 'Not set'}
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Delivery Statistics */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView style={styles.statsHeader}>
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Delivery Statistics
              </ResponsiveText>
              <Button
                title="Refresh"
                onPress={refreshStats}
                variant="text"
                size="small"
                icon={<MaterialIcons name="refresh" size={16} color={colors.primary} />}
              />
            </ResponsiveView>
            
            {/* Debug Info */}
            {__DEV__ && (
              <ResponsiveView style={[styles.debugInfo, { backgroundColor: colors.background }]}>
                <ResponsiveText size="xs" color={colors.textSecondary}>
                  Debug: Profile ID: {profile?.id || 'None'} | Stats: {JSON.stringify(stats)}
                </ResponsiveText>
              </ResponsiveView>
            )}
            
            <ResponsiveView style={[styles.statsCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
            <ResponsiveView style={styles.statsContainer}>
              <ResponsiveView style={[styles.statCard, { backgroundColor: colors.background }]}>
                <MaterialIcons name="local-shipping" size={24} color={colors.primary} />
                <ResponsiveView style={styles.statContent}>
                  <ResponsiveText size="lg" weight="bold" color={colors.text}>
                    {stats.totalDeliveries || 0}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Total Deliveries
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>

              <ResponsiveView style={[styles.statCard, { backgroundColor: colors.background }]}>
                <MaterialIcons name="check-circle" size={24} color={colors.success} />
                <ResponsiveView style={styles.statContent}>
                  <ResponsiveText size="lg" weight="bold" color={colors.text}>
                    {stats.completedDeliveries || 0}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Completed
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>

            <ResponsiveView style={styles.statsContainer}>
              <ResponsiveView style={[styles.statCard, { backgroundColor: colors.background }]}>
                <MaterialIcons name="attach-money" size={24} color={colors.warning} />
                <ResponsiveView style={styles.statContent}>
                  <ResponsiveText size="lg" weight="bold" color={colors.text}>
                    ₱{(stats.todayEarnings || 0).toFixed(2)}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Today's Earnings
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>

              <ResponsiveView style={[styles.statCard, { backgroundColor: colors.background }]}>
                <MaterialIcons name="account-balance-wallet" size={24} color={colors.info} />
                <ResponsiveView style={styles.statContent}>
                  <ResponsiveText size="lg" weight="bold" color={colors.text}>
                    ₱{(stats.totalEarnings || 0).toFixed(2)}
                  </ResponsiveText>
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Total Earnings
                  </ResponsiveText>
                  </ResponsiveView>
                </ResponsiveView>
              </ResponsiveView>
            </ResponsiveView>
          </ResponsiveView>

          {/* Account Actions Section */}
          <ResponsiveView style={styles.section}>
            <ResponsiveView marginBottom="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Account Actions
              </ResponsiveText>
            </ResponsiveView>
            
            <ResponsiveView style={[styles.actionsCard, { 
              backgroundColor: colors.surface,
              ...Layout.shadows.sm
            }]}>
              {profileActions.map((action, index) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.actionItem,
                    action.variant === 'danger' && styles.dangerAction
                  ]}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <ResponsiveView style={styles.actionContent}>
                    <ResponsiveView style={styles.actionLeft}>
                      <ResponsiveView style={[
                        styles.actionIcon,
                        { backgroundColor: action.variant === 'danger' ? colors.error + '20' : colors.surfaceVariant }
                      ]}>
                        <MaterialIcons 
                          name={action.icon} 
                          size={24} 
                          color={action.variant === 'danger' ? colors.error : colors.themedText} 
                        />
                      </ResponsiveView>
                      <ResponsiveView style={styles.actionText}>
                        <ResponsiveText 
                          size="md" 
                          weight="medium" 
                          color={action.variant === 'danger' ? colors.error : colors.text}
                        >
                          {action.title}
              </ResponsiveText>
                        {action.subtitle && (
                          <ResponsiveView marginTop="xs">
                            <ResponsiveText size="sm" color={colors.textSecondary}>
                              {action.subtitle}
              </ResponsiveText>
                          </ResponsiveView>
                        )}
                      </ResponsiveView>
                    </ResponsiveView>
                    {action.showChevron && (
                      <MaterialIcons 
                        name="chevron-right" 
                        size={24} 
                        color={colors.textTertiary} 
                      />
                    )}
                  </ResponsiveView>
                </TouchableOpacity>
              ))}
            </ResponsiveView>
          </ResponsiveView>

          {/* Availability Toggle */}
          <ResponsiveView style={styles.section}>
            <Button
              title={profile?.is_available ? 'Set Unavailable' : 'Set Available'}
              onPress={handleToggleAvailability}
              variant="outline"
              size="large"
              fullWidth
              icon={<MaterialIcons name={profile?.is_available ? 'pause' : 'play-arrow'} size={20} color={colors.primary} />}
            />
          </ResponsiveView>

          {/* Sign Out Button */}
          <ResponsiveView style={styles.signOutSection}>
            <Button
              title={Strings.signOut}
              onPress={handleSignOut}
              variant="danger"
              size="large"
              fullWidth
              icon={<MaterialIcons name="logout" size={20} color={colors.textInverse} />}
            />
          </ResponsiveView>
            </ResponsiveView>
            
        {/* Edit Profile Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleCancelEdit}
        >
          <ResponsiveView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <ResponsiveView style={[styles.modalHeader, { 
              backgroundColor: colors.surface,
              borderBottomColor: colors.border 
            }]}>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.modalCancelButton}>
                <ResponsiveText size="md" color={colors.primary}>{Strings.cancel}</ResponsiveText>
              </TouchableOpacity>
              <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
                Edit Profile
              </ResponsiveText>
              <TouchableOpacity 
                onPress={handleSaveProfile} 
                style={styles.modalSaveButton}
                disabled={isUpdating}
              >
                <ResponsiveText 
                  size="md" 
                  color={isUpdating ? colors.textTertiary : colors.primary}
                  weight="semiBold"
                >
                  {isUpdating ? 'Saving...' : Strings.save}
              </ResponsiveText>
              </TouchableOpacity>
            </ResponsiveView>
            
            <ScrollView style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <ResponsiveView style={styles.formSection}>
                <ResponsiveView marginBottom="sm">
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    {Strings.fullName} *
                  </ResponsiveText>
                </ResponsiveView>
                <TextInput
                  style={[styles.textInput, { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface 
                  }]}
                  value={editForm.fullName}
                  onChangeText={(text: string) => setEditForm(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </ResponsiveView>

              <ResponsiveView style={styles.formSection}>
                <ResponsiveView marginBottom="sm">
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    {Strings.phoneNumber}
                  </ResponsiveText>
                </ResponsiveView>
                <TextInput
                  style={[styles.textInput, { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.surface 
                  }]}
                  value={editForm.phoneNumber}
                  onChangeText={(text: string) => setEditForm(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              </ResponsiveView>

              <ResponsiveView style={styles.formSection}>
                <ResponsiveView marginBottom="sm">
                  <ResponsiveText size="md" weight="medium" color={colors.text}>
                    {Strings.email}
              </ResponsiveText>
                </ResponsiveView>
                <TextInput
                  style={[styles.textInput, styles.disabledInput, { 
                    borderColor: colors.border,
                    color: colors.textTertiary,
                    backgroundColor: colors.surfaceVariant 
                  }]}
                  value={user?.email || ''}
                  editable={false}
                  placeholderTextColor={colors.textTertiary}
                />
                <ResponsiveView marginTop="xs">
                  <ResponsiveText size="sm" color={colors.textSecondary}>
                    Email cannot be changed. Contact support if you need to update your email.
              </ResponsiveText>
            </ResponsiveView>
              </ResponsiveView>
            </ScrollView>
          </ResponsiveView>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  avatarContainer: {
    marginRight: Layout.spacing.md,
    position: 'relative',
  },
  avatar: {
    width: Layout.sizes.avatarLarge,
    height: Layout.sizes.avatarLarge,
    borderRadius: Layout.sizes.avatarLarge / 2,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Layout.sizes.avatarLarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  availabilityContainer: {
    marginTop: Layout.spacing.sm,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  infoCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  actionsCard: {
    borderRadius: Layout.borderRadius.lg,
  },
  actionItem: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  actionText: {
    flex: 1,
  },
  dangerAction: {
    // Additional styling for danger actions if needed
  },
  signOutSection: {
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
  },
  retryButton: {
    marginTop: Layout.spacing.md,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Layout.spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  modalCancelButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
  },
  modalSaveButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Layout.spacing.md,
  },
  formSection: {
    marginTop: Layout.spacing.lg,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontFamily: Layout.fontFamily.regular,
  },
  disabledInput: {
    opacity: 0.6,
  },
  statsCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadows.sm,
  },
  statContent: {
    marginLeft: Layout.spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  debugInfo: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.sm,
  },
});