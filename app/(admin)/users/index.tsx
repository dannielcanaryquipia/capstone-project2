import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { AdminCard, AdminLayout, AdminSection } from '../../../components/admin';
import { useAlert } from '../../../components/ui/AlertProvider';
import { DropdownMenuItem } from '../../../components/ui/DropdownMenu';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks';
import { User, UserFilters, UserService } from '../../../services/user.service';

const roleTabs = ['All', 'Customer', 'Admin', 'Delivery Staff'];

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const { confirm, confirmDestructive, success, error, show } = useAlert();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCounts, setUserCounts] = useState({
    total: 0,
    customers: 0,
    admins: 0,
    deliveryStaff: 0
  });
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // Auto-reset search when input is cleared
  useEffect(() => {
    if (!searchQuery.trim() && activeSearchQuery.trim()) {
      // If search input is empty but active search has value, reset it
      setActiveSearchQuery('');
    }
  }, [searchQuery, activeSearchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters: UserFilters = {};
      
      if (activeTab !== 'All') {
        switch (activeTab) {
          case 'Customer': filters.role = 'customer'; break;
          case 'Admin': filters.role = 'admin'; break;
          case 'Delivery Staff': filters.role = 'delivery'; break;
        }
      }
      
      // Only add search filter if there's an active search query
      if (activeSearchQuery && activeSearchQuery.trim()) {
        filters.search = activeSearchQuery.trim();
        console.log('Search query:', activeSearchQuery.trim());
      }
      
      console.log('Loading users with filters:', filters);
      const usersData = await UserService.getUsers(filters);
      console.log('Admin users page - received users:', usersData?.length || 0);
      console.log('Active tab:', activeTab, 'Search query:', activeSearchQuery, 'Filters:', filters);
      console.log('Users data:', usersData.map(u => ({ id: u.id, name: u.full_name, role: u.role })));
      setUsers(usersData);
      
      // Calculate user counts
      const counts = {
        total: usersData.length,
        customers: usersData.filter(u => u.role === 'customer').length,
        admins: usersData.filter(u => u.role === 'admin').length,
        deliveryStaff: usersData.filter(u => u.role === 'delivery').length
      };
      setUserCounts(counts);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeSearchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    // Don't trigger search automatically - wait for user to submit
  }, []);

  const handleSearchSubmit = useCallback(() => {
    // Trigger search only when user presses Enter
    setActiveSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
  }, []);

  // Removed Activate/Deactivate user logic as requested

  const handleChangeRole = async (userId: string, currentRole: string, userName: string) => {
    // Define available role transitions
    const getAvailableRoles = (currentRole: string) => {
      switch (currentRole) {
        case 'customer':
          return [
            { value: 'delivery', label: 'Delivery Staff', icon: 'delivery-dining' }
          ];
        case 'delivery':
          return [
            { value: 'customer', label: 'Customer', icon: 'person' }
          ];
        case 'admin':
          return [
            { value: 'customer', label: 'Customer', icon: 'person' },
            { value: 'delivery', label: 'Delivery Staff', icon: 'delivery-dining' }
          ];
        default:
          return [];
      }
    };

    const availableRoles = getAvailableRoles(currentRole);
    
    if (availableRoles.length === 0) {
      error('No Role Changes Available', 'This user role cannot be changed.');
      return;
    }

    // Create role selection buttons
    const roleButtons: Array<{text: string, onPress: () => void, style: 'default' | 'cancel' | 'destructive'}> = availableRoles.map(role => ({
      text: `Change to ${role.label}`,
      onPress: () => confirmRoleChange(userId, role.value, role.label, userName),
      style: 'default'
    }));

    // Add cancel button
    roleButtons.push({
      text: 'Cancel',
      onPress: async () => {},
      style: 'destructive'
    });

    // Show the role selection using the alert system
    show(
      'Change User Role',
      `Select a new role for ${userName} (currently ${currentRole.replace('_', ' ').toUpperCase()})`,
      roleButtons,
      { type: 'info' }
    );
  };

  const confirmRoleChange = async (userId: string, newRole: string, roleLabel: string, userName: string) => {
    try {
      await UserService.changeUserRole(userId, newRole);
      await loadUsers();
      success('Role Updated Successfully', `${userName} is now a ${roleLabel}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      error('Update Failed', 'Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const deleteUser = async () => {
      try {
        await UserService.deleteUser(userId);
        await loadUsers();
        success('User Deleted', `${userName} has been successfully deleted.`);
      } catch (err) {
        console.error('Error deleting user:', err);
        error('Delete Failed', 'Failed to delete user. Please try again.');
      }
    };

    confirmDestructive(
      'Delete User',
      `Are you sure you want to permanently delete ${userName}? This action cannot be undone.`,
      deleteUser,
      undefined,
      'Delete',
      'Cancel'
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return colors.error;
      case 'delivery': return colors.success;
      case 'customer': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'admin-panel-settings';
      case 'delivery': return 'delivery-dining';
      case 'customer': return 'person';
      default: return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderUserItem = ({ item }: { item: User }) => {
    // Check if current user is trying to edit themselves
    const isCurrentUser = currentUser?.id === item.id;
    
    const actionMenuItems: DropdownMenuItem[] = isCurrentUser ? [
      {
        id: 'self-edit-disabled',
        title: 'Cannot edit own account',
        icon: 'block',
        disabled: true,
        onPress: () => {},
      },
    ] : [
      {
        id: 'change-role',
        title: 'Change Role',
        icon: 'swap-horiz',
        onPress: () => handleChangeRole(item.id, item.role, item.full_name),
      },
      {
        id: 'delete-user',
        title: 'Delete User',
        icon: 'delete',
        destructive: true,
        onPress: () => handleDeleteUser(item.id, item.full_name),
      },
    ];

    return (
      <AdminCard
        title={item.full_name}
        subtitle={item.email}
        icon={
          <MaterialIcons 
            name={getRoleIcon(item.role)} 
            size={responsiveValue(20, 22, 24, 28)} 
            color={getRoleColor(item.role)} 
          />
        }
        variant="outlined"
        style={[
          styles.userCard,
          isCurrentUser && [styles.currentUserCard, { borderColor: colors.primary }]
        ]}
        showActionMenu={true}
        actionMenuItems={actionMenuItems}
        disabled={isCurrentUser}
      >
        <ResponsiveView style={styles.userMeta}>
          <ResponsiveView style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
            <MaterialIcons 
              name={getRoleIcon(item.role)} 
              size={responsiveValue(12, 14, 16, 18)} 
              color={getRoleColor(item.role)} 
            />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText 
                size="xs" 
                color={getRoleColor(item.role)}
                weight="semiBold"
              >
                {item.role.replace('_', ' ').toUpperCase()}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          
          {isCurrentUser && (
            <ResponsiveView style={[styles.currentUserBadge, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons 
                name="person" 
                size={responsiveValue(12, 14, 16, 18)} 
                color={colors.primary} 
              />
              <ResponsiveView marginLeft="xs">
                <ResponsiveText 
                  size="xs" 
                  color={colors.primary}
                  weight="semiBold"
                >
                  YOU
                </ResponsiveText>
              </ResponsiveView>
            </ResponsiveView>
          )}
        </ResponsiveView>

        <ResponsiveView style={styles.contactInfo}>
          <MaterialIcons name="phone" size={responsiveValue(12, 14, 16, 18)} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="sm" color={colors.textSecondary} style={styles.phoneNumber}>
              {item.phone_number || 'No contact number'}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>

        <ResponsiveView style={styles.userFooter}>
          <ResponsiveView style={styles.dateInfo}>
            <MaterialIcons name="calendar-today" size={responsiveValue(12, 14, 16, 18)} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Joined: {formatDate(item.created_at)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>

      </AdminCard>
    );
  };

  if (loading) {
    return (
      <AdminLayout
        title="User Management"
        subtitle="Loading..."
        showBackButton={true}
        onBackPress={() => router.replace('/(admin)/dashboard')}
        backgroundColor={colors.background}
      >
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="User Management"
      subtitle={`Manage ${userCounts.total} users in your system`}
      showBackButton={true}
      onBackPress={() => router.replace('/(admin)/dashboard')}
      backgroundColor={colors.background}
    >

      {/* Search Bar */}
      <ResponsiveView flexDirection="row" alignItems="center" paddingHorizontal="lg" marginVertical="md">
        <ResponsiveView 
          flex={1}
          flexDirection="row" 
          alignItems="center" 
          backgroundColor={colors.surface}
          borderRadius="md"
          paddingHorizontal="md"
          height={responsiveValue(40, 44, 48, 52)}
          style={[styles.searchBarShadow, { borderColor: colors.border, borderWidth: 1 }]}
        >
          <MaterialIcons 
            name="search" 
            size={responsiveValue(20, 22, 24, 26)} 
            color={colors.textSecondary}
            style={{ marginRight: ResponsiveSpacing.sm }}
          />
          <TextInput
            style={[
              styles.searchInput, 
              { 
                color: colors.text,
                fontSize: responsiveValue(14, 16, 18, 20)
              }
            ]}
            placeholder="Search users by name or phone"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearSearch}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons 
                name="clear" 
                size={responsiveValue(18, 20, 22, 24)} 
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </ResponsiveView>
      </ResponsiveView>

      {/* Role Filter */}
      <ResponsiveView marginBottom="sm">
        <FlatList
          data={roleTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: ResponsiveSpacing.md }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                {
                  backgroundColor: activeTab === item ? colors.primary : 'transparent',
                  borderColor: activeTab === item ? colors.primary : colors.border,
                  borderWidth: 1,
                },
                activeTab === item && styles.categoryItemActive,
              ]}
              onPress={() => setActiveTab(item)}
            >
              <ResponsiveText
                size="sm"
                color={activeTab === item ? 'white' : colors.text}
                weight={activeTab === item ? 'semiBold' : 'regular'}
                style={{ textAlign: 'center', lineHeight: undefined }}
              >
                {item}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </ResponsiveView>

      {users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <AdminSection title="No Users Found" variant="card">
          <ResponsiveView style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <ResponsiveView style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialIcons name="people" size={responsiveValue(48, 56, 64, 72)} color={colors.primary} />
            </ResponsiveView>
            <ResponsiveView marginTop="md">
              <ResponsiveText size="lg" weight="semiBold" color={colors.text} align="center">
                No Users Found
              </ResponsiveText>
            </ResponsiveView>
            <ResponsiveView marginTop="sm">
              <ResponsiveText size="md" color={colors.textSecondary} align="center">
                {activeTab === 'All' 
                  ? 'No users have been registered yet.'
                  : `No ${activeTab.toLowerCase()} users found.`
                }
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </AdminSection>
      )}
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: responsiveValue(14, 16, 18, 20),
  },
  clearButton: {
    padding: ResponsiveSpacing.xs,
    marginLeft: ResponsiveSpacing.xs,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveValue(12, 14, 16, 18),
    paddingVertical: responsiveValue(6, 8, 10, 12),
    borderRadius: responsiveValue(16, 18, 20, 22),
    marginRight: responsiveValue(6, 8, 10, 12),
    minWidth: responsiveValue(72, 80, 88, 100),
    minHeight: responsiveValue(36, 40, 44, 48),
  },
  categoryItemActive: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
  },
  usersList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  userCard: {
    marginBottom: ResponsiveSpacing.md,
  },
  currentUserCard: {
    opacity: 0.8,
    borderWidth: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
    gap: ResponsiveSpacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  currentUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.sm,
  },
  phoneNumber: {
    flex: 1,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ResponsiveSpacing.md,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  emptyIcon: {
    width: responsiveValue(80, 90, 100, 120),
    height: responsiveValue(80, 90, 100, 120),
    borderRadius: responsiveValue(40, 45, 50, 60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.md,
  },
});
