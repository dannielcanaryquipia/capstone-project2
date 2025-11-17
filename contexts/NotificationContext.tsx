import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Notification } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/api';
import { useRefreshCoordinator } from './RefreshCoordinatorContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  displayNotifications: Notification[];
  displayUnreadCount: number;
  hiddenUnreadCount: number;
  isFilteringDeliveryNotifications: boolean;
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
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);
  const [displayUnreadCount, setDisplayUnreadCount] = useState(0);
  const [hiddenUnreadCount, setHiddenUnreadCount] = useState(0);
  const [isFilteringDeliveryNotifications, setIsFilteringDeliveryNotifications] = useState(false);
  const { user, isDelivery } = useAuth();
  const { registerRefresh } = useRefreshCoordinator();

  // Helper function to deduplicate notifications
  const deduplicateNotifications = useCallback((notifications: Notification[]): Notification[] => {
    const ONE_MINUTE = 60 * 1000; // 1 minute in milliseconds
    const seen = new Map<string, Notification>();
    
    // Sort by created_at descending (newest first) to keep the most recent duplicates
    const sorted = [...notifications].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
    
    const deduplicated: Notification[] = [];
    
    for (const notification of sorted) {
      // Create a key based on order ID, type, and normalized title
      const orderId = notification.related_order_id || 'none';
      const type = notification.type;
      const normalizedTitle = notification.title.toLowerCase()
        .replace(/order\s+#?[a-z0-9-]+/gi, 'order')
        .replace(/ord-[a-z0-9]+/gi, 'order')
        .trim();
      
      const key = `${orderId}-${type}-${normalizedTitle}`;
      
      // Check if we've seen a similar notification recently
      const existing = seen.get(key);
      if (existing) {
        const timeDiff = Math.abs(
          new Date(notification.created_at).getTime() - 
          new Date(existing.created_at).getTime()
        );
        
        // If notifications are within 1 minute and have similar content, skip the duplicate
        if (timeDiff < ONE_MINUTE) {
          console.log('🔔 Skipping duplicate notification:', {
            id: notification.id,
            title: notification.title,
            existingId: existing.id,
            timeDiff: timeDiff,
          });
          continue;
        }
      }
      
      // Add to seen map and deduplicated list
      seen.set(key, notification);
      deduplicated.push(notification);
    }
    
    // Re-sort to maintain chronological order (newest first)
    return deduplicated.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      console.log('NotificationContext - No user ID, skipping fetch');
      return;
    }
    
    try {
      console.log('NotificationContext - Fetching notifications for user:', user.id);
      setIsLoading(true);
      setError(null);
      // Fetch ALL notifications without limit
      const data = await notificationService.getNotifications(user.id);
      console.log('NotificationContext - Fetched notifications:', data.length);
      
      // Deduplicate notifications to remove redundant entries
      const deduplicated = deduplicateNotifications(data);
      console.log('NotificationContext - After deduplication:', deduplicated.length, 'notifications');
      
      setNotifications(deduplicated);
      
      // Calculate unread count
      const unread = deduplicated.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      console.log('NotificationContext - Unread count:', unread);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, deduplicateNotifications]);

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
              // Check if notification already exists by ID (avoid exact duplicates)
              const existsById = prev.some(n => n.id === newNotification.id);
              if (existsById) {
                console.log('🔔 Notification already exists in list (by ID), skipping duplicate');
                return prev;
              }
              
              // Check for similar notifications using deduplication logic
              const ONE_MINUTE = 60 * 1000;
              const orderId = newNotification.related_order_id || 'none';
              const type = newNotification.type;
              const normalizedTitle = newNotification.title.toLowerCase()
                .replace(/order\s+#?[a-z0-9-]+/gi, 'order')
                .replace(/ord-[a-z0-9]+/gi, 'order')
                .trim();
              
              const similarExists = prev.some(n => {
                const nOrderId = n.related_order_id || 'none';
                const nType = n.type;
                const nNormalizedTitle = n.title.toLowerCase()
                  .replace(/order\s+#?[a-z0-9-]+/gi, 'order')
                  .replace(/ord-[a-z0-9]+/gi, 'order')
                  .trim();
                
                if (orderId === nOrderId && type === nType && normalizedTitle === nNormalizedTitle) {
                  const timeDiff = Math.abs(
                    new Date(newNotification.created_at).getTime() - 
                    new Date(n.created_at).getTime()
                  );
                  // If similar notification exists within 1 minute, skip this one
                  if (timeDiff < ONE_MINUTE) {
                    return true;
                  }
                }
                return false;
              });
              
              if (similarExists) {
                console.log('🔔 Similar notification already exists (deduplication), skipping duplicate');
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
  // This is a fallback mechanism - the real-time subscription should handle most notification updates
  // We only refresh here if the real-time subscription might have missed something
  useEffect(() => {
    if (!user?.id) {
      console.log('NotificationContext - No user ID, skipping order update subscription');
      return;
    }

    console.log('NotificationContext - Setting up order update subscription for user:', user.id);

    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

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
          console.log('🔄 NotificationContext - Order update detected:', {
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
            // Clear any pending refresh to avoid multiple refreshes
            if (refreshTimeout) {
              clearTimeout(refreshTimeout);
            }
            
            // Use a single delayed refresh (2 seconds) to allow notification to be created
            // The real-time subscription should handle most cases, this is just a fallback
            refreshTimeout = setTimeout(() => {
              console.log('🔄 Order status changed, performing fallback notification refresh...');
              fetchNotifications();
              refreshTimeout = null;
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('NotificationContext - Cleaning up order update subscription');
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      supabase.removeChannel(orderChannel);
    };
  }, [user?.id, fetchNotifications]);

  // Derive rider-visible notifications (only delivery orders) so all rider UIs stay in sync
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setDisplayNotifications([]);
      setDisplayUnreadCount(0);
      setHiddenUnreadCount(0);
      setIsFilteringDeliveryNotifications(false);
      return;
    }

    if (!isDelivery) {
      setDisplayNotifications(notifications);
      setDisplayUnreadCount(unreadCount);
      setHiddenUnreadCount(0);
      setIsFilteringDeliveryNotifications(false);
      return;
    }

    const orderIds = Array.from(
      new Set(
        notifications
          .map((notification) => notification.related_order_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (orderIds.length === 0) {
      setDisplayNotifications(notifications);
      setDisplayUnreadCount(unreadCount);
      setHiddenUnreadCount(0);
      setIsFilteringDeliveryNotifications(false);
      return;
    }

    let isActive = true;
    setIsFilteringDeliveryNotifications(true);

    const filterNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, fulfillment_type')
          .in('id', orderIds);

        if (!isActive) return;

        if (error) {
          console.error('NotificationContext - Failed to fetch fulfillment types for rider filtering:', error);
          setDisplayNotifications(notifications);
          setDisplayUnreadCount(unreadCount);
          setHiddenUnreadCount(0);
          return;
        }

        const fulfillmentMap = new Map<string, string>();
        (data || []).forEach((order: any) => {
          if (order?.id) {
            fulfillmentMap.set(order.id, order.fulfillment_type);
          }
        });

        const filtered = notifications.filter((notification) => {
          if (!notification.related_order_id) {
            return true;
          }

          const fulfillmentType = fulfillmentMap.get(notification.related_order_id);

          if (!fulfillmentType) {
            console.warn('NotificationContext - Missing fulfillment type for notification, hiding from rider:', {
              notificationId: notification.id,
              orderId: notification.related_order_id,
            });
            return false;
          }

          return fulfillmentType === 'delivery';
        });

        const filteredUnread = filtered.filter((notification) => !notification.is_read).length;

        setDisplayNotifications(filtered);
        setDisplayUnreadCount(filteredUnread);
        setHiddenUnreadCount(Math.max(0, unreadCount - filteredUnread));
      } finally {
        if (isActive) {
          setIsFilteringDeliveryNotifications(false);
        }
      }
    };

    filterNotifications();

    return () => {
      isActive = false;
    };
  }, [notifications, unreadCount, isDelivery]);

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
    displayNotifications: isDelivery ? displayNotifications : notifications,
    displayUnreadCount: isDelivery ? displayUnreadCount : unreadCount,
    hiddenUnreadCount: isDelivery ? hiddenUnreadCount : 0,
    isFilteringDeliveryNotifications,
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
