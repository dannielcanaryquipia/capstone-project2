import { Notification } from '../lib/database.types';

export type NotificationGroup = {
  title: string;
  key: 'today' | 'thisWeek' | 'thisMonth' | 'older';
  notifications: Notification[];
};

/**
 * Groups notifications by time periods: Today, This Week, This Month, and Older
 */
export const groupNotificationsByTime = (notifications: Notification[]): NotificationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today);
  thisWeek.setDate(today.getDate() - 7);
  const thisMonth = new Date(today);
  thisMonth.setMonth(today.getMonth() - 1);

  const groups: NotificationGroup[] = [
    { title: 'Today', key: 'today', notifications: [] },
    { title: 'This Week', key: 'thisWeek', notifications: [] },
    { title: 'This Month', key: 'thisMonth', notifications: [] },
    { title: 'Older', key: 'older', notifications: [] },
  ];

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.created_at);
    const notificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    if (notificationDay.getTime() >= today.getTime()) {
      // Today
      groups[0].notifications.push(notification);
    } else if (notificationDay.getTime() >= thisWeek.getTime()) {
      // This Week
      groups[1].notifications.push(notification);
    } else if (notificationDay.getTime() >= thisMonth.getTime()) {
      // This Month
      groups[2].notifications.push(notification);
    } else {
      // Older
      groups[3].notifications.push(notification);
    }
  });

  // Filter out empty groups and return only groups with notifications
  return groups.filter((group) => group.notifications.length > 0);
};

/**
 * Formats a date for display in group headers
 */
export const formatGroupDate = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Month Day, Year" for older dates
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

