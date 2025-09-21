import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, UserFilters, UserService } from '../../../services/user.service';

const roleTabs = ['All', 'Customer', 'Admin', 'Delivery Staff'];

export default function AdminUsersScreen() {
  const { colors } = useTheme();
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

  useEffect(() => {
    loadUsers();
  }, [activeTab, searchQuery]);

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
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      const usersData = await UserService.getUsers(filters);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    Alert.alert(
      'Toggle User Status',
      `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: currentStatus ? 'Deactivate' : 'Activate', 
          onPress: async () => {
            try {
              await UserService.toggleUserStatus(userId);
              await loadUsers();
              Alert.alert('Success', `User ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
            } catch (error) {
              console.error('Error updating user:', error);
              Alert.alert('Error', 'Failed to update user. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleChangeRole = async (userId: string, currentRole: string, userName: string) => {
    const roleOptions = ['customer', 'admin', 'delivery'];
    const currentIndex = roleOptions.indexOf(currentRole);
    const nextRole = roleOptions[(currentIndex + 1) % roleOptions.length];
    
    Alert.alert(
      'Change User Role',
      `Change ${userName}'s role from ${currentRole.replace('_', ' ')} to ${nextRole.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change Role', 
          onPress: async () => {
            try {
              await UserService.changeUserRole(userId, nextRole);
              await loadUsers();
              Alert.alert('Success', 'User role updated successfully!');
            } catch (error) {
              console.error('Error updating user role:', error);
              Alert.alert('Error', 'Failed to update user role. Please try again.');
            }
          }
        }
      ]
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

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/(admin)/users/${item.id}` as any)}
    >
      <ResponsiveView style={styles.userHeader}>
        <ResponsiveView style={styles.userInfo}>
          <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
            {item.full_name}
          </ResponsiveText>
          <ResponsiveText size="sm" color={colors.textSecondary}>
            {item.email}
          </ResponsiveText>
          {item.phone_number && (
            <ResponsiveText size="sm" color={colors.textSecondary}>
              {item.phone_number}
            </ResponsiveText>
          )}
        </ResponsiveView>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
      </ResponsiveView>

      <ResponsiveView style={styles.userMeta}>
        <ResponsiveView style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
          <MaterialIcons 
            name={getRoleIcon(item.role)} 
            size={14} 
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
        
        <ResponsiveView 
          style={[
            styles.statusBadge, 
            { backgroundColor: item.is_active ? `${colors.success}20` : `${colors.error}20` }
          ]}
        >
          <MaterialIcons 
            name={item.is_active ? 'check-circle' : 'cancel'} 
            size={14} 
            color={item.is_active ? colors.success : colors.error} 
          />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText 
              size="xs" 
              color={item.is_active ? colors.success : colors.error}
              weight="semiBold"
            >
              {item.is_active ? 'Active' : 'Inactive'}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </ResponsiveView>

      {item.role === 'customer' && (
        <ResponsiveView style={styles.customerStats}>
          <ResponsiveView style={styles.statItem}>
            <MaterialIcons name="receipt" size={16} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                {item.total_orders || 0} orders
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
          <ResponsiveView style={styles.statItem}>
            <MaterialIcons name="attach-money" size={16} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="sm" color={colors.textSecondary}>
                ₱{(item.total_spent || 0).toFixed(2)} spent
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        </ResponsiveView>
      )}

      <ResponsiveView style={styles.userFooter}>
        <ResponsiveView style={styles.dateInfo}>
          <MaterialIcons name="calendar-today" size={14} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="xs" color={colors.textSecondary}>
              Joined: {formatDate(item.created_at)}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
        
        {item.last_login && (
          <ResponsiveView style={styles.dateInfo}>
            <MaterialIcons name="login" size={14} color={colors.textSecondary} />
            <ResponsiveView marginLeft="xs">
              <ResponsiveText size="xs" color={colors.textSecondary}>
                Last login: {formatDate(item.last_login)}
              </ResponsiveText>
            </ResponsiveView>
          </ResponsiveView>
        )}
      </ResponsiveView>

      <ResponsiveView style={styles.userActions}>
        <Button
          title={item.is_active ? 'Deactivate' : 'Activate'}
          onPress={() => handleToggleUserStatus(item.id, item.is_active, item.full_name)}
          variant="outline"
          size="small"
        />
        <Button
          title="Change Role"
          onPress={() => handleChangeRole(item.id, item.role, item.full_name)}
          variant="primary"
          size="small"
        />
      </ResponsiveView>
    </TouchableOpacity>
  );

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
      <ResponsiveView style={styles.header}>
        <ResponsiveText size="xl" weight="bold" color={colors.text}>
          User Management
        </ResponsiveText>
        <ResponsiveText size="md" color={colors.textSecondary}>
          Manage {userCounts.total} users in your system
        </ResponsiveText>
      </ResponsiveView>

      {/* Search Section */}
      <ResponsiveView style={styles.searchContainer}>
        <ResponsiveText size="sm" color={colors.textSecondary} style={styles.searchLabel}>
          Search Users
        </ResponsiveText>
        <View style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchTextInput, { color: colors.text }]}
            placeholder="Search by name, email, or username"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ResponsiveView>

      {/* Role Filter */}
      <ResponsiveView style={styles.filterContainer}>
        <ResponsiveText size="sm" color={colors.textSecondary} style={styles.filterLabel}>
          Filter by Role:
        </ResponsiveText>
      </ResponsiveView>

      {/* Role Tabs */}
      <ResponsiveView style={styles.tabsContainer}>
        <FlatList
          data={roleTabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === item && { 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                activeTab !== item && { borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(item)}
            >
              <ResponsiveText 
                size="sm" 
                weight="medium"
                color={activeTab === item ? colors.background : colors.text}
              >
                {item}
              </ResponsiveText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
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
        <ResponsiveView style={styles.emptyState}>
          <MaterialIcons name="people" size={64} color={colors.textSecondary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="lg" weight="semiBold" color={colors.text}>
              No Users Found
            </ResponsiveText>
          </ResponsiveView>
          <ResponsiveView marginTop="sm">
            <ResponsiveText size="md" color={colors.textSecondary} style={{ textAlign: 'center' }}>
              {activeTab === 'All' 
                ? 'No users have been registered yet.'
                : `No ${activeTab.toLowerCase()} users found.`
              }
            </ResponsiveText>
          </ResponsiveView>
          
          <ResponsiveView marginTop="lg">
            <Button
              title="Add First User"
              onPress={() => router.push('/(admin)/users/add' as any)}
              variant="primary"
            />
          </ResponsiveView>
        </ResponsiveView>
      )}
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
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  searchContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  searchLabel: {
    marginBottom: Layout.spacing.sm,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    gap: Layout.spacing.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: Layout.fontSize.md,
  },
  filterContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.sm,
  },
  filterLabel: {
    marginBottom: Layout.spacing.sm,
  },
  tabsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  tabsList: {
    gap: Layout.spacing.sm,
  },
  tab: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  usersList: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: 0,
  },
  userCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    ...Layout.shadows.sm,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
