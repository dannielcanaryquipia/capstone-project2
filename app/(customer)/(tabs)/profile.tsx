import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import Button from '../../../components/ui/Button';
import ResponsiveText from '../../../components/ui/ResponsiveText';
import ResponsiveView from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import Strings from '../../../constants/Strings';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCurrentUserProfile } from '../../../hooks/useProfile';
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

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, isLoading, error, refresh, updateProfile } = useCurrentUserProfile();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleEditPress = () => {
    setEditForm({
      fullName: profile?.full_name || '',
      phoneNumber: profile?.phone_number || '',
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        full_name: editForm.fullName.trim(),
        phone_number: editForm.phoneNumber.trim() || null,
      });
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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

  const handleSignOut = () => {
    Alert.alert(
      Strings.signOut,
      Strings.confirmLogout,
      [
        {
          text: Strings.cancel,
          style: 'cancel',
        },
        {
          text: Strings.signOut,
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
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
      id: 'addresses',
      title: 'Manage Addresses',
      subtitle: 'Add or edit delivery addresses',
      icon: 'location-on',
      onPress: () => router.push('/(customer)/profile/addresses'),
      showChevron: true,
    },
    {
      id: 'settings',
      title: Strings.settings,
      subtitle: 'App preferences and notifications',
      icon: 'settings',
      onPress: () => router.push('/(customer)/profile/settings'),
      showChevron: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-outline',
      onPress: () => router.push('/(customer)/profile/help-support'),
      showChevron: true,
    },
    {
      id: 'about',
      title: `About ${Strings.appName}`,
      subtitle: 'Learn more about our app',
      icon: 'info-outline',
      onPress: () => {
        Alert.alert(
          `About ${Strings.appName}`,
          `${Strings.appName} is a modern food delivery app that brings delicious meals right to your doorstep. We are committed to providing the best dining experience with fresh ingredients and excellent service.\n\nVersion 1.0.0`,
          [{ text: 'OK' }]
        );
      },
      showChevron: true,
    },
  ];

  if (isLoading && !profile) {
    return (
      <ResponsiveView style={[global.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ResponsiveView marginTop="md">
          <ResponsiveText size="md" color={colors.textSecondary}>
            {Strings.loading}
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>
    );
  }

  if (error) {
    return (
      <ResponsiveView style={[global.screen, styles.center]} padding="lg">
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
    );
  }

  return (
    <ScrollView 
      style={[global.screen, { backgroundColor: colors.background }]}
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
          <ResponsiveView style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <ResponsiveView style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}>
                <MaterialIcons name="person" size={40} color={colors.textSecondary} />
              </ResponsiveView>
            )}
          </ResponsiveView>
          
          <ResponsiveView style={styles.userInfo}>
            <ResponsiveText size="xl" weight="bold" color={colors.text}>
              {profile?.full_name || 'User Name'}
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
          </ResponsiveView>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.surfaceVariant }]}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={24} color={colors.primary} />
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
            <ResponsiveView style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <ResponsiveView style={styles.infoLabel}>
                <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="person" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="md" color={colors.textSecondary}>
                    Full Name
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                {profile?.full_name || 'Not provided'}
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <ResponsiveView style={styles.infoLabel}>
                <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="alternate-email" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="md" color={colors.textSecondary}>
                    Username
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                {user?.email?.split('@')[0] || 'Not provided'}
              </ResponsiveText>
            </ResponsiveView>

            <ResponsiveView style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <ResponsiveView style={styles.infoLabel}>
                <ResponsiveView style={[styles.infoIcon, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialIcons name="email" size={20} color={colors.primary} />
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
                  <MaterialIcons name="phone" size={20} color={colors.primary} />
                </ResponsiveView>
                <ResponsiveView marginLeft="sm">
                  <ResponsiveText size="md" color={colors.textSecondary}>
                    Phone Number
                  </ResponsiveText>
                </ResponsiveView>
              </ResponsiveView>
              <ResponsiveText size="md" weight="medium" color={colors.text}>
                {profile?.phone_number || 'Not provided'}
              </ResponsiveText>
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
                  index < profileActions.length - 1 && { borderBottomColor: colors.border },
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
                        color={action.variant === 'danger' ? colors.error : colors.primary} 
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
  },
  avatar: {
    width: Layout.sizes.avatarLarge,
    height: Layout.sizes.avatarLarge,
    borderRadius: Layout.sizes.avatarLarge / 2,
  },
  userInfo: {
    flex: 1,
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
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
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
});


