import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Notification } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/api';
import { useRefreshCoordinator } from './RefreshCoordinatorContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
  sendNotification: (notification: {
    userId: string;
    title: string;
    message: string;
    type: 'order_update' | 'payment' | 'delivery' | 'system';
    relatedId?: string;
  }) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { registerRefresh } = useRefreshCoordinator();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      console.log('NotificationContext - No user ID, skipping fetch');
      return;
    }
    
    try {
      console.log('NotificationContext - Fetching notifications for user:', user.id);
      setIsLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(user.id, 50);
      console.log('NotificationContext - Fetched notifications:', data.length);
      
      // Ensure notifications are sorted by created_at in descending order (newest first - LIFO)
      const sortedNotifications = [...data].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      });
      
      
      setNotifications(sortedNotifications);
      
      // Calculate unread count
      const unread = sortedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      console.log('NotificationContext - Unread count:', unread);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Register with refresh coordinator
  useEffect(() => {
    const unregister = registerRefresh('notifications', fetchNotifications);
    return unregister;
  }, [registerRefresh, fetchNotifications]);

  // Real-time subscription for notification updates
  useEffect(() => {
    if (!user?.id) {
      console.log('NotificationContext - No user ID, skipping real-time subscription');
      return;
    }

    console.log('NotificationContext - Setting up real-time subscription for user:', user.id);

    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 NotificationContext - Real-time update received:', {
            eventType: payload.eventType,
            notificationId: (payload.new as any)?.id || (payload.old as any)?.id,
            title: (payload.new as any)?.title || (payload.old as any)?.title,
          });
          
          if (payload.eventType === 'INSERT') {
            console.log('🔔 Inserting new notification:', payload.new);
            const newNotification = payload.new as Notification;
            
            // Add new notification to the top of the list (LIFO - newest first)
            setNotifications(prev => {
              // Check if notification already exists (avoid duplicates)
              const exists = prev.some(n => n.id === newNotification.id);
              if (exists) {
                console.log('🔔 Notification already exists in list, skipping duplicate');
                return prev;
              }
              
              console.log('🔔 Adding notification to list. Previous count:', prev.length);
              const updatedList = [newNotification, ...prev];
              // Ensure the list remains sorted by created_at in descending order
              const sorted = updatedList.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              console.log('🔔 New notification added. Total count:', sorted.length);
              return sorted;
            });
            
            // Only increment unread count if notification is unread
            if (!newNotification.is_read) {
              setUnreadCount(prev => {
                const newCount = prev + 1;
                console.log('🔔 Updated unread count:', newCount);
                return newCount;
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            console.log('🔔 Updating notification:', payload.new);
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
              setUnreadCount(prev => {
                const newCount = payload.new.is_read ? prev - 1 : prev + 1;
                console.log('🔔 Updated unread count after status change:', newCount);
                return newCount;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            console.log('🔔 Deleting notification:', payload.old);
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
      console.log('NotificationContext - Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Subscribe to order updates to automatically refresh notifications when orders change
  // This ensures notifications are refreshed even if the notification INSERT event doesn't trigger properly
  useEffect(() => {
    if (!user?.id) {
      console.log('NotificationContext - No user ID, skipping order update subscription');
      return;
    }

    console.log('NotificationContext - Setting up order update subscription for user:', user.id);

    const orderChannel = supabase
      .channel(`user-orders-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('🔄 NotificationContext - Order update detected, refreshing notifications:', {
            orderId: (payload.new as any)?.id,
            status: (payload.new as any)?.status,
            oldStatus: (payload.old as any)?.status,
            paymentStatus: (payload.new as any)?.payment_status,
            oldPaymentStatus: (payload.old as any)?.payment_status,
          });
          
          // Refresh if status changed OR payment status changed (payment verification also sends notifications)
          const statusChanged = (payload.old as any)?.status !== (payload.new as any)?.status;
          const paymentStatusChanged = (payload.old as any)?.payment_status !== (payload.new as any)?.payment_status;
          
          if (statusChanged || paymentStatusChanged) {
            console.log('🔄 Order status or payment status changed, refreshing notifications...');
            
            // When order is marked as delivered, we need to ensure notification is refreshed
            // Use a retry mechanism with increasing delays to ensure notification is created in database
            const refreshWithRetry = (attempt: number = 0) => {
              const delays = [1000, 2000, 3000]; // Progressive delays - increased for delivered status
              const delay = delays[attempt] || delays[delays.length - 1];
              
              setTimeout(() => {
                console.log(`🔄 Executing notification refresh after order update (attempt ${attempt + 1})...`);
                fetchNotifications();
                
                // For delivered status, do multiple retries to ensure notification is picked up
                if (attempt < 2 && (payload.new as any)?.status === 'delivered') {
                  refreshWithRetry(attempt + 1);
                }
              }, delay);
            };
            
            // Start refresh immediately and with retries
            refreshWithRetry(0);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('NotificationContext - Cleaning up order update subscription');
      supabase.removeChannel(orderChannel);
    };
  }, [user?.id, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
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
  };

  const markAllAsRead = async () => {
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
  };

  const sendNotification = async (notification: {
    userId: string;
    title: string;
    message: string;
    type: 'order_update' | 'payment' | 'delivery' | 'system';
    relatedId?: string;
  }) => {
    try {
      await notificationService.sendNotification(notification);
    } catch (err: any) {
      console.error('Error sending notification:', err);
      setError(err.message || 'Failed to send notification');
    }
  };

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    sendNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
