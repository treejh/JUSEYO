import { create } from "zustand";

interface Notification {
  id: number;
  message: string;
  notificationType: string;
  createdAt: string;
  readStatus: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => {
      // 이미 존재하는 알림인지 확인
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) {
        return state; // 이미 존재하면 상태 변경하지 않음
      }
      return {
        notifications: [notification, ...state.notifications],
      };
    }),
  fetchNotifications: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications?page=0&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      set({ notifications: data.notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },
  markAsRead: async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/${id}/read`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, readStatus: true } : n
        ),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },
  markAllAsRead: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/readAll`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          readStatus: true,
        })),
      }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },
  clearNotifications: () => set({ notifications: [] }),
}));
