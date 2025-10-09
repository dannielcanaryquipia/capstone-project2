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
  TouchableOpacity
} from 'react-native';
import { AdminCard, AdminLayout, AdminSection } from '../../../components/admin';
import Button from '../../../components/ui/Button';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
import { ResponsiveView } from '../../../components/ui/ResponsiveView';
import Layout from '../../../constants/Layout';
import { ResponsiveBorderRadius, ResponsiveSpacing, responsiveValue } from '../../../constants/Responsive';
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
        console.log('Search query:', searchQuery.trim());
      }
      
      const usersData = await UserService.getUsers(filters);
      console.log('Admin users page - received users:', usersData?.length || 0);
      console.log('Active tab:', activeTab, 'Search query:', searchQuery, 'Filters:', filters);
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
      style={styles.userCard}
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
      </ResponsiveView>

      {item.phone_number && (
        <ResponsiveText size="sm" color={colors.textSecondary} style={styles.phoneNumber}>
          {item.phone_number}
        </ResponsiveText>
      )}

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
    </AdminCard>
  );

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
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <MaterialIcons 
              name="clear" 
              size={responsiveValue(18, 20, 22, 24)} 
              color={colors.textSecondary}
              style={styles.clearButton}
            />
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
    shadowColor: '#FFE44D',
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
  phoneNumber: {
    marginBottom: ResponsiveSpacing.sm,
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
