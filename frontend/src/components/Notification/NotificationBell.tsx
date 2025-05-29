import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/stores/notifications";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
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
  | "STOCK_SHORTAGE"
  | "SUPPLY_REQUEST_APPROVED"
  | "SUPPLY_REQUEST_REJECTED"
  | "SUPPLY_REQUEST_DELAYED"
  | "RETURN_DUE_DATE_EXCEEDED"
  | "RETURN_DUE_SOON"
  | "NOT_RETURNED_YET"
  | "NEW_CHAT"
  | "ADMIN_APPROVAL_ALERT"
  | "MANAGER_APPROVAL_ALERT"
  | "MANAGER_REJECTION_ALERT"
  | "ADMIN_REJECTION_ALERT"
  | "SUPPLY_RETURN_APPROVED"
  | "NEW_USER"
  | "NEW_USER_APPROVED"
  | "NEW_USER_REJECTED";

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
      "STOCK_SHORTAGE",
      "SUPPLY_REQUEST_APPROVED",
      "SUPPLY_REQUEST_REJECTED",
      "SUPPLY_REQUEST_DELAYED",
      "SUPPLY_RETURN_APPROVED",
    ],
    color: "blue",
  },
  RETURN: {
    label: "반납 관리",
    types: ["RETURN_DUE_DATE_EXCEEDED", "RETURN_DUE_SOON", "NOT_RETURNED_YET"],
    color: "yellow",
  },
  CHAT: {
    label: "채팅",
    types: ["NEW_CHAT"],
    color: "green",
  },
  SYSTEM: {
    label: "시스템",
    types: [
      "ADMIN_APPROVAL_ALERT",
      "MANAGER_APPROVAL_ALERT",
      "MANAGER_REJECTION_ALERT",
      "ADMIN_REJECTION_ALERT",
      "NEW_USER",
      "NEW_USER_APPROVED",
      "NEW_USER_REJECTED",
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
    label: "반납일 초과",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  RETURN_DUE_SOON: {
    label: "반납일 임박",
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
  SUPPLY_RETURN_APPROVED: {
    label: "비품 반납 승인",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  NOT_RETURNED_YET: {
    label: "장기 미반납",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_USER: {
    label: "새로운 회원",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_USER_APPROVED: {
    label: "회원 승인",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_USER_REJECTED: {
    label: "회원 거부",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const router = useRouter();

  // BroadcastChannel 설정
  useEffect(() => {
    const channel = new BroadcastChannel("notifications");

    // 다른 탭에서 온 알림 수신
    channel.onmessage = (event) => {
      if (event.data.type === "MARK_AS_READ") {
        // 읽음 처리
        markAsRead(event.data.notificationId);
      } else if (event.data.type === "MARK_ALL_AS_READ") {
        // 전체 읽음 처리
        markAllAsRead();
      } else if (event.data.type === "NEW_NOTIFICATION") {
        // 새 알림 추가
        useNotificationStore.getState().addNotification(event.data.data);
      }
    };

    return () => {
      channel.close();
    };
  }, [markAsRead, markAllAsRead]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

      if (!response.ok) {
        throw new Error("알림 상태 변경에 실패했습니다.");
      }

      // 스토어 업데이트
      markAllAsRead();

      // 다른 탭에 알림
      const channel = new BroadcastChannel("notifications");
      channel.postMessage({
        type: "MARK_ALL_AS_READ",
      });
      channel.close();
    } catch (err) {
      console.error("알림 상태 변경 중 오류가 발생했습니다:", err);
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

      if (!response.ok) {
        throw new Error("알림 상태 변경에 실패했습니다.");
      }

      // 스토어 업데이트
      markAsRead(notificationId);

      // 다른 탭에 알림
      const channel = new BroadcastChannel("notifications");
      channel.postMessage({
        type: "MARK_AS_READ",
        notificationId,
      });
      channel.close();
    } catch (err) {
      console.error("알림 상태 변경 중 오류가 발생했습니다:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const getNotificationCategory = (type: string) => {
    return Object.entries(NOTIFICATION_CATEGORIES).find(([_, category]) =>
      category.types.includes(type as NotificationType)
    )?.[1];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none mr-2 transition-all duration-200 hover:bg-gray-100 rounded-full"
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
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 transform transition-all duration-200">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {unreadCount}개
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all duration-200"
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

          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {notifications.filter((n) => !n.readStatus).length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                </div>
                <p className="text-gray-500 text-sm">새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications
                  .filter((n) => !n.readStatus)
                  .map((notification) => {
                    const category = getNotificationCategory(
                      notification.notificationType
                    );
                    return (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          if (
                            notification.notificationType === "SUPPLY_REQUEST"
                          ) {
                            router.push("/item/supplyrequest/list/manage");
                          }
                          // 다른 알림 타입에 대한 처리도 여기에 추가할 수 있습니다
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                                  NOTIFICATION_TYPE_LABELS[
                                    notification.notificationType
                                  ]?.color || "bg-gray-100 text-gray-800"
                                } bg-opacity-50 backdrop-blur-sm`}
                              >
                                <span>
                                  {NOTIFICATION_TYPE_LABELS[
                                    notification.notificationType
                                  ]?.label || "알림"}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
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
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex-shrink-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-all duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-100">
            <Link
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-white py-2 rounded-lg transition-all duration-200"
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
