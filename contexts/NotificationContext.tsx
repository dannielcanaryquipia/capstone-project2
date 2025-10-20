import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Notification } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/api';

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

  const fetchNotifications = async () => {
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
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

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

  const refresh = async () => {
    await fetchNotifications();
  };

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
