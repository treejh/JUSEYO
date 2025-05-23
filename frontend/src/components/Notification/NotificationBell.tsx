import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/stores/notifications";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: number;
  message: string;
  notificationType: string;
  createdAt: string;
  readStatus: boolean;
}

type NotificationType =
  | "SUPPLY_REQUEST"
  | "SUPPLY_RETURN"
  | "SUPPLY_RETURN_ALERT"
  | "STOCK_REACHED"
  | "STOCK_SHORTAGE"
  | "SUPPLY_REQUEST_MODIFIED"
  | "SUPPLY_REQUEST_APPROVED"
  | "SUPPLY_REQUEST_REJECTED"
  | "SUPPLY_REQUEST_DELAYED"
  | "RETURN_DUE_DATE_EXCEEDED"
  | "RETURN_DUE_SOON"
  | "LONG_TERM_UNRETURNED_SUPPLIES"
  | "USER_SENT_MESSAGE_TO_MANAGER"
  | "NEW_CHAT"
  | "SYSTEM_MAINTENANCE"
  | "ADMIN_APPROVAL_ALERT"
  | "MANAGER_APPROVAL_ALERT";

interface NotificationCategory {
  label: string;
  types: NotificationType[];
  color: "blue" | "yellow" | "green" | "gray" | "red";
}

const NOTIFICATION_CATEGORIES: Record<string, NotificationCategory> = {
  SUPPLY: {
    label: "비품 관리",
    types: [
      "SUPPLY_REQUEST",
      "SUPPLY_RETURN",
      "SUPPLY_RETURN_ALERT",
      "STOCK_REACHED",
      "STOCK_SHORTAGE",
      "SUPPLY_REQUEST_MODIFIED",
      "SUPPLY_REQUEST_APPROVED",
      "SUPPLY_REQUEST_REJECTED",
      "SUPPLY_REQUEST_DELAYED",
    ],
    color: "blue",
  },
  RETURN: {
    label: "반납 관리",
    types: [
      "RETURN_DUE_DATE_EXCEEDED",
      "RETURN_DUE_SOON",
      "LONG_TERM_UNRETURNED_SUPPLIES",
    ],
    color: "yellow",
  },
  CHAT: {
    label: "채팅",
    types: ["USER_SENT_MESSAGE_TO_MANAGER", "NEW_CHAT"],
    color: "green",
  },
  SYSTEM: {
    label: "시스템",
    types: [
      "SYSTEM_MAINTENANCE",
      "ADMIN_APPROVAL_ALERT",
      "MANAGER_APPROVAL_ALERT",
    ],
    color: "gray",
  },
};

const NOTIFICATION_TYPE_LABELS: Record<
  string,
  { label: string; color: string; icon: React.ReactElement }
> = {
  SUPPLY_REQUEST: {
    label: "비품 요청",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_RETURN: {
    label: "비품 반납",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_RETURN_ALERT: {
    label: "비품 반납 알림",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  STOCK_REACHED: {
    label: "재고 도달",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  STOCK_SHORTAGE: {
    label: "재고 부족",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_MODIFIED: {
    label: "비품 요청 수정",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_APPROVED: {
    label: "비품 요청 승인",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_REJECTED: {
    label: "비품 요청 반려",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_DELAYED: {
    label: "비품 요청 처리 지연",
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  RETURN_DUE_DATE_EXCEEDED: {
    label: "지정 반납일 초과",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  RETURN_DUE_SOON: {
    label: "지정 반납일 임박",
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  LONG_TERM_UNRETURNED_SUPPLIES: {
    label: "장기 미반납",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  USER_SENT_MESSAGE_TO_MANAGER: {
    label: "채팅 알림",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_CHAT: {
    label: "새로운 채팅",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SYSTEM_MAINTENANCE: {
    label: "시스템 점검",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  ADMIN_APPROVAL_ALERT: {
    label: "관리 페이지 승인",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  MANAGER_APPROVAL_ALERT: {
    label: "매니저 승인",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/readAll`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (response.ok) {
        markAllAsRead();
        if (notifications.length === 0) {
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: "PUT",
          credentials: "include",
        }
      );
      if (response.ok) {
        markAsRead(notificationId);
        if (notifications.length === 1) {
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const getNotificationCategory = (type: string) => {
    return Object.entries(NOTIFICATION_CATEGORIES).find(([_, category]) =>
      category.types.includes(type as NotificationType)
    )?.[1];
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {unreadCount}개
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  모두 읽음
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.filter((n) => !n.readStatus).length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                새로운 알림이 없습니다
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications
                  .filter((n) => !n.readStatus)
                  .map((notification) => {
                    return (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                                  NOTIFICATION_TYPE_LABELS[
                                    notification.notificationType
                                  ]?.color || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {NOTIFICATION_TYPE_LABELS[
                                  notification.notificationType
                                ]?.label || "알림"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(() => {
                                const distance = formatDistanceToNow(
                                  new Date(notification.createdAt),
                                  {
                                    addSuffix: true,
                                    locale: ko,
                                  }
                                );
                                return distance === "1분 미만 전"
                                  ? "방금 전"
                                  : distance;
                              })()}
                            </p>
                          </div>
                          <div className="flex items-end mt-2">
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              확인
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t">
            <Link
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setIsOpen(false)}
            >
              모든 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
