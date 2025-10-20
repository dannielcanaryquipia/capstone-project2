import { useCallback, useEffect, useState } from 'react';
import { Notification } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/api';
import { useAuth } from './useAuth';

export interface NotificationFilters {
  type?: 'order_update' | 'payment' | 'delivery' | 'system';
  isRead?: boolean;
  limit?: number;
}

export const useNotifications = (filters?: NotificationFilters) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(user.id, filters?.limit || 20);
      
      // Ensure notifications are sorted by created_at in descending order (newest first - LIFO)
      const sortedNotifications = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotifications(sortedNotifications);
      
      // Calculate unread count
      const unread = sortedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filters?.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription for notification updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new notification to the top of the list (LIFO - newest first)
            setNotifications(prev => {
              const newNotification = payload.new as Notification;
              const updatedList = [newNotification, ...prev];
              // Ensure the list remains sorted by created_at in descending order
              return updatedList.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing notification and maintain order
            setNotifications(prev => {
              const updatedList = prev.map(notification => 
                notification.id === payload.new.id 
                  ? payload.new as Notification 
                  : notification
              );
              // Re-sort to ensure proper order after update
              return updatedList.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
            
            // Update unread count if read status changed
            if (payload.old.is_read !== payload.new.is_read) {
              setUnreadCount(prev => 
                payload.new.is_read ? prev - 1 : prev + 1
              );
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted notification
            setNotifications(prev => 
              prev.filter(notification => notification.id !== payload.old.id)
            );
            if (!payload.old.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, [user?.id]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
};

// Hook for a specific notification
export const useNotification = (notificationId: string) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotification = useCallback(async () => {
    if (!notificationId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Get notification from the notifications list or fetch individually
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();
      
      if (error) throw error;
      setNotification(data);
    } catch (err: any) {
      console.error('Error fetching notification:', err);
      setError(err.message || 'Failed to load notification');
    } finally {
      setIsLoading(false);
    }
  }, [notificationId]);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  // Real-time subscription for specific notification updates
  useEffect(() => {
    if (!notificationId) return;

    const channel = supabase
      .channel(`notification-${notificationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `id=eq.${notificationId}`,
        },
        (payload) => {
          console.log('Notification update received:', payload);
          setNotification(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notificationId]);

  const markAsRead = useCallback(async () => {
    if (!notification) return;
    
    try {
      await notificationService.markAsRead(notification.id);
      setNotification(prev => prev ? { ...prev, is_read: true } : null);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  }, [notification]);

  return {
    notification,
    isLoading,
    error,
    markAsRead,
    refresh: fetchNotification,
  };
};
