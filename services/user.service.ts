import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'delivery';
  is_active: boolean;
  is_blocked?: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  total_orders?: number;
  total_spent?: number;
}

export interface UserFilters {
  role?: string;
  is_active?: boolean;
  search?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  customers: number;
  admins: number;
  delivery_staff: number;
  new_users_this_month: number;
}

export class UserService {
  // Get all users with filters
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      // First, let's check what roles exist in the database
      const { data: allRoles, error: rolesError } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'is', null);
      
      if (!rolesError) {
        console.log('All roles in database:', [...new Set(allRoles?.map((r: any) => r.role) || [])]);
      }

      let query = supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          phone_number,
          role,
          avatar_url,
          created_at,
          updated_at,
          email_verified,
          phone_verified,
          last_login,
          preferences,
          is_blocked,
          orders:orders!orders_user_id_fkey(count),
          total_spent:orders!orders_user_id_fkey(sum:total_amount)
        `)
        .order('created_at', { ascending: false });

      if (filters?.role) {
        // Handle historical/alternate value 'delivery_staff' used in some databases
        if (filters.role === 'delivery') {
          query = query.in('role', ['delivery', 'delivery_staff']);
        } else {
          query = query.eq('role', filters.role);
        }
      }

      // Note: is_active doesn't exist in schema, so we use is_blocked instead
      // If is_active filter is provided, we'll use !is_blocked as active
      if (filters?.is_active !== undefined) {
        query = query.eq('is_blocked', !filters.is_active);
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('UserService.getUsers error:', error);
        throw error;
      }

      console.log('UserService.getUsers data:', data?.length || 0, 'users found');
      console.log('UserService.getUsers filters:', filters);
      console.log('UserService.getUsers roles found:', data?.map((u: any) => ({ id: u.id, role: u.role, name: u.full_name })));

      // Transform the data to include order statistics and normalize role values
      return (data || []).map((user: any) => {
        const normalizedRole = user.role === 'delivery_staff' ? 'delivery' : user.role;
        return {
          id: user.id,
          email: '', // Email not available in profiles table
          full_name: user.full_name,
          phone_number: user.phone_number,
          role: normalizedRole,
          is_active: true, // is_active doesn't exist in schema, default to true
          is_blocked: user.is_blocked || false,
          created_at: user.created_at,
          updated_at: user.updated_at,
          last_login: user.last_login,
          total_orders: user.orders?.[0]?.count || 0,
          total_spent: user.total_spent?.[0]?.sum || 0,
        } as User;
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          phone_number,
          role,
          avatar_url,
          created_at,
          updated_at,
          email_verified,
          phone_verified,
          last_login,
          preferences,
          is_blocked,
          orders:orders!orders_user_id_fkey(count),
          total_spent:orders!orders_user_id_fkey(sum:total_amount)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: '', // Email not available in profiles table (use username instead)
        full_name: data.full_name,
        phone_number: data.phone_number,
        avatar_url: data.avatar_url,
        role: data.role,
        is_active: true, // is_active doesn't exist in schema, default to true
        is_blocked: data.is_blocked || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        total_orders: data.orders?.[0]?.count || 0,
        total_spent: data.total_spent?.[0]?.sum || 0,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(
    userId: string, 
    updates: Partial<User>
  ): Promise<User> {
    try {
      // Filter out fields that don't exist in the profiles table
      const { email, total_orders, total_spent, is_active, ...validUpdates } = updates;
      
      // Only include fields that exist in the profiles table schema
      const profileUpdates: any = {};
      if (validUpdates.full_name !== undefined) profileUpdates.full_name = validUpdates.full_name;
      if (validUpdates.phone_number !== undefined) profileUpdates.phone_number = validUpdates.phone_number;
      if (validUpdates.avatar_url !== undefined) profileUpdates.avatar_url = validUpdates.avatar_url;
      if (validUpdates.role !== undefined) profileUpdates.role = validUpdates.role;
      if (validUpdates.is_blocked !== undefined) profileUpdates.is_blocked = validUpdates.is_blocked;
      // Note: is_active doesn't exist in the profiles table schema, so we skip it
      
      // Update and explicitly select only existing columns to avoid schema cache issues
      // Also update updated_at timestamp
      profileUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select(`
          id,
          username,
          full_name,
          phone_number,
          role,
          avatar_url,
          created_at,
          updated_at,
          email_verified,
          phone_verified,
          last_login,
          preferences,
          is_blocked
        `)
        .single();

      if (error) throw error;
      
      // Return the updated user data in the expected format
      return {
        id: data.id,
        email: '', // Email not available in profiles table
        full_name: data.full_name,
        phone_number: data.phone_number,
        avatar_url: data.avatar_url,
        role: data.role,
        is_active: true, // is_active doesn't exist in schema, default to true
        is_blocked: data.is_blocked || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_login: data.last_login,
        total_orders: 0, // Will be fetched separately if needed
        total_spent: 0, // Will be fetched separately if needed
      } as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Toggle user status
  static async toggleUserStatus(userId: string): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) throw new Error('User not found');

      return await this.updateUser(userId, {
        is_active: !user.is_active,
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  // Change user role
  static async changeUserRole(userId: string, newRole: string): Promise<User> {
    try {
      return await this.updateUser(userId, {
        role: newRole as any,
      });
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  }

  // Block user
  static async blockUser(userId: string): Promise<User> {
    try {
      return await this.updateUser(userId, {
        is_blocked: true,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  // Unblock user
  static async unblockUser(userId: string): Promise<User> {
    try {
      return await this.updateUser(userId, {
        is_blocked: false,
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  // Delete user (kept for backward compatibility, but should use block instead)
  static async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<UserStats> {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('role, is_blocked, created_at');

      if (error) throw error;

      // Since is_active doesn't exist, we'll use !is_blocked as active
      const stats: UserStats = {
        total_users: users.length,
        active_users: users.filter((u: any) => !u.is_blocked).length,
        inactive_users: users.filter((u: any) => u.is_blocked).length,
        customers: users.filter((u: any) => u.role === 'customer').length,
        admins: users.filter((u: any) => u.role === 'admin').length,
        delivery_staff: users.filter((u: any) => u.role === 'delivery').length,
        new_users_this_month: users.filter((u: any) => 
          new Date(u.created_at).getMonth() === new Date().getMonth()
        ).length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          phone_number,
          role,
          avatar_url,
          created_at,
          email_verified,
          phone_verified,
          last_login,
          preferences,
          is_blocked,
          orders:orders!orders_user_id_fkey(count),
          total_spent:orders!orders_user_id_fkey(sum:total_amount)
        `)
        .or(`full_name.ilike.%${query}%`)
        .order('full_name', { ascending: true });

      if (error) throw error;

      return (data || []).map((user: any) => ({
        id: user.id,
        email: '', // Email not available in profiles table
        full_name: user.full_name,
        phone_number: user.phone_number,
        role: user.role,
        is_active: true, // is_active doesn't exist in schema, default to true
        is_blocked: user.is_blocked || false,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        total_orders: user.orders?.[0]?.count || 0,
        total_spent: user.total_spent?.[0]?.sum || 0,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await this.getUsers({ role });
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Get active users
  static async getActiveUsers(): Promise<User[]> {
    try {
      return await this.getUsers({ is_active: true });
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }

  // Get inactive users
  static async getInactiveUsers(): Promise<User[]> {
    try {
      return await this.getUsers({ is_active: false });
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      throw error;
    }
  }
}
