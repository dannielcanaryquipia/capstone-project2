import { MaterialIcons } from '@expo/vector-icons';
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
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
import { Strings } from '../../../constants/Strings';
import { useTheme } from '../../../contexts/ThemeContext';
import { User, UserFilters, UserService } from '../../../services/user.service';
import global from '../../../styles/global';

const roleTabs = ['All', 'Customer', 'Admin', 'Delivery Staff'];

export default function AdminUsersScreen() {
  const { colors } = useTheme();
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
      console.log('Admin users page - received users:', usersData?.length || 0);
      console.log('Active tab:', activeTab, 'Filters:', filters);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // Removed Activate/Deactivate user logic as requested

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

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await UserService.deleteUser(userId);
              await loadUsers();
              Alert.alert('Success', 'User deleted successfully!');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user. Please try again.');
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
    <View
      style={[styles.userCard, { 
        backgroundColor: colors.surface, 
        ...Layout.shadows.sm
      }]}
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
        {/* Removed chevron navigation */}
      </ResponsiveView>

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
        
        {/* Status badge removed */}
      </ResponsiveView>

      {/* Removed orders and spent stats */}

      <ResponsiveView style={styles.userFooter}>
        <ResponsiveView style={styles.dateInfo}>
          <MaterialIcons name="calendar-today" size={responsiveValue(12, 14, 16, 18)} color={colors.textSecondary} />
          <ResponsiveView marginLeft="xs">
            <ResponsiveText size="xs" color={colors.textSecondary}>
              Joined: {formatDate(item.created_at)}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
        
        {/* Removed last login display */}
      </ResponsiveView>

      <ResponsiveView style={styles.userActions}>
        <Button
          title="Change Role"
          onPress={() => handleChangeRole(item.id, item.role, item.full_name)}
          variant="primary"
          size="small"
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteUser(item.id, item.full_name)}
          variant="danger"
          size="small"
        />
      </ResponsiveView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[global.screen, styles.center, { backgroundColor: colors.background }]}>
        <ResponsiveView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ResponsiveView marginTop="md">
            <ResponsiveText size="md" color={colors.textSecondary}>
              {Strings.loading}
            </ResponsiveText>
          </ResponsiveView>
        </ResponsiveView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[global.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ResponsiveView padding="lg">
        <ResponsiveView style={[styles.header, { backgroundColor: colors.surface }]}>
          <ResponsiveText size="xl" weight="bold" color={colors.text}>
            User Management
          </ResponsiveText>
          <ResponsiveText size="md" color={colors.textSecondary}>
            Manage {userCounts.total} users in your system
          </ResponsiveText>
        </ResponsiveView>
      </ResponsiveView>

      {/* Search Section */}
      <ResponsiveView padding="lg">
        <ResponsiveView style={styles.searchContainer}>
          <ResponsiveText size="sm" color={colors.textSecondary} style={styles.searchLabel}>
            Search Users
          </ResponsiveText>
          <View style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialIcons name="search" size={responsiveValue(18, 20, 22, 24)} color={colors.textSecondary} />
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
          
          {/* Removed Add First User button (routing) */}
        </ResponsiveView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveSpacing.lg,
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    ...Layout.shadows.sm,
  },
  searchContainer: {
    marginBottom: ResponsiveSpacing.lg,
  },
  searchLabel: {
    marginBottom: ResponsiveSpacing.sm,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.md,
    borderWidth: 1,
    gap: ResponsiveSpacing.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: responsiveValue(14, 16, 18, 20),
  },
  filterContainer: {
    marginBottom: ResponsiveSpacing.sm,
  },
  filterLabel: {
    marginBottom: ResponsiveSpacing.sm,
  },
  tabsContainer: {
    marginBottom: ResponsiveSpacing.lg,
  },
  tabsList: {
    gap: ResponsiveSpacing.sm,
  },
  tab: {
    paddingHorizontal: ResponsiveSpacing.md,
    paddingVertical: ResponsiveSpacing.sm,
    borderRadius: ResponsiveBorderRadius.pill,
    borderWidth: 1,
  },
  usersList: {
    paddingHorizontal: ResponsiveSpacing.lg,
    paddingTop: 0,
  },
  userCard: {
    padding: ResponsiveSpacing.md,
    borderRadius: ResponsiveBorderRadius.lg,
    marginBottom: ResponsiveSpacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ResponsiveSpacing.sm,
  },
  userInfo: {
    flex: 1,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.xs,
    borderRadius: ResponsiveBorderRadius.sm,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ResponsiveSpacing.sm,
    paddingVertical: ResponsiveSpacing.sm,
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
    marginBottom: ResponsiveSpacing.md,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ResponsiveSpacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ResponsiveSpacing.xxxl,
    paddingHorizontal: ResponsiveSpacing.lg,
    marginHorizontal: ResponsiveSpacing.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
