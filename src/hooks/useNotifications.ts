
import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  const scheduleNotification = useCallback((title: string, body: string, scheduledTime: Date) => {
    if (permission !== 'granted') {
      requestPermission();
      return;
    }

    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Show notification immediately if time has passed
      showNotification(title, body);
      return;
    }

    // Schedule notification
    setTimeout(() => {
      showNotification(title, body);
    }, delay);
  }, [permission, requestPermission]);

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'reminder',
        requireInteraction: true,
        silent: false
      });

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }, [permission]);

  const showInstantNotification = useCallback((title: string, body: string) => {
    showNotification(title, body);
  }, [showNotification]);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    showInstantNotification
  };
};
