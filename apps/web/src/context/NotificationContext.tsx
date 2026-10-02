import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, NotificationType } from '../types';
import { appStorage } from '../lib/storage';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dispatchNotification: (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) => void;
  requestWebPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let user: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = useAuth();
    user = auth?.user;
  } catch {
    user = null;
  }
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const all = appStorage.getNotifications();
    if (user) {
      const userNotifs = all.filter((n) => n.user_id === user.id || user.role === 'admin');
      setNotifications(userNotifs);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    const all = appStorage.getNotifications();
    const updated = all.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    appStorage.setNotifications(updated);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllAsRead = () => {
    const all = appStorage.getNotifications();
    const updated = all.map((n) =>
      user && (n.user_id === user.id || user.role === 'admin') ? { ...n, is_read: true } : n
    );
    appStorage.setNotifications(updated);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const dispatchNotification = (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) => {
    const all = appStorage.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      type,
      title,
      message,
      link,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const updated = [newNotif, ...all];
    appStorage.setNotifications(updated);

    if (user && (userId === user.id || user.role === 'admin')) {
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const requestWebPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dispatchNotification,
        requestWebPushPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
