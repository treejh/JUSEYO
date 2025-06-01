import { create } from "zustand";

interface Notification {
  id: number;
  message: string;
  notificationType: string;
  createdAt: string;
  readStatus: boolean;
  extraData?: {
    chatRoomType?: string;
    [key: string]: any;
  };
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
  addNotification: (notification) => {
    // 이미 존재하는 알림인지 확인
    const exists = useNotificationStore
      .getState()
      .notifications.some((n) => n.id === notification.id);

    if (exists) {
      return;
    }

    // 스토어 업데이트
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));

    // 다른 탭에 알림
    const channel = new BroadcastChannel("notifications");
    channel.postMessage({
      type: "NEW_NOTIFICATION",
      data: notification,
    });
    channel.close();
  },
  fetchNotifications: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("API Response for notifications:", data);
      set({ notifications: data });
    } catch (error) {
      console.error("알림을 불러오는 중 오류가 발생했습니다:", error);
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
