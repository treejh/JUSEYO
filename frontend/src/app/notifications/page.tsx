"use client";

import { useEffect, useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

type NotificationType =
  | "SUPPLY_REQUEST"
  | "STOCK_SHORTAGE"
  | "CHAT"
  | "RETURN_OVERDUE";

interface Notification {
  id: number;
  message: string;
  notificationType: NotificationType;
  createdAt: string;
  readStatus: boolean;
}

const NOTIFICATION_TYPE_LABELS: Record<
  NotificationType,
  { label: string; color: string }
> = {
  SUPPLY_REQUEST: { label: "재고 요청", color: "bg-blue-100 text-blue-800" },
  STOCK_SHORTAGE: { label: "재고 부족", color: "bg-red-100 text-red-800" },
  CHAT: { label: "채팅", color: "bg-green-100 text-green-800" },
  RETURN_OVERDUE: {
    label: "반납 초과",
    color: "bg-yellow-100 text-yellow-800",
  },
};

export default function NotificationsPage() {
  const { loginUser } = useGlobalLoginUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    []
  );
  const [selectedType, setSelectedType] = useState<NotificationType | "ALL">(
    "ALL"
  );
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/user/${loginUser.id}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      // 최신순 정렬
      setNotifications(
        data.sort(
          (a: Notification, b: Notification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loginUser.id) {
      fetchNotifications();
    }
  }, [loginUser.id]);

  const handleCheckboxChange = (notificationId: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const deletePromises = selectedNotifications.map((id) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/delete?notificationId=${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        )
      );

      await Promise.all(deletePromises);
      setSelectedNotifications([]);
      fetchNotifications();
    } catch (err) {
      setError("알림 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/read-all`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림 상태 변경에 실패했습니다.");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, readStatus: true }))
      );
    } catch (err) {
      setError("알림 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const markAsReadPromises = selectedNotifications.map((id) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/read/${id}`,
          {
            method: "PUT",
            credentials: "include",
          }
        )
      );

      await Promise.all(markAsReadPromises);
      setSelectedNotifications([]);
      fetchNotifications();
    } catch (err) {
      setError("알림 상태 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/delete?notificationId=${notificationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림 삭제에 실패했습니다.");
      }

      fetchNotifications();
    } catch (err) {
      setError("알림 삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (showUnreadOnly && notification.readStatus) return false;
    if (
      selectedType !== "ALL" &&
      notification.notificationType !== selectedType
    )
      return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">알림 목록</h1>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              전체 읽음 처리
            </button>
            {selectedNotifications.length > 0 && (
              <button
                onClick={handleMarkSelectedAsRead}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                선택 읽음 처리
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("ALL")}
              className={`px-3 py-1 rounded-md ${
                selectedType === "ALL"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {Object.entries(NOTIFICATION_TYPE_LABELS).map(
              ([type, { label }]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as NotificationType)}
                  className={`px-3 py-1 rounded-md ${
                    selectedType === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showUnreadOnly"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showUnreadOnly" className="text-sm text-gray-700">
                안 읽은 알림만 보기
              </label>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredNotifications.length}개의 알림
              </span>
              {selectedNotifications.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedNotifications.length}개 선택됨
                </span>
              )}
            </div>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            새로운 알림이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-4 ${
                  !notification.readStatus ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleCheckboxChange(notification.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              NOTIFICATION_TYPE_LABELS[
                                notification.notificationType
                              ]?.color || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {NOTIFICATION_TYPE_LABELS[
                              notification.notificationType
                            ]?.label || "알림"}
                          </span>
                          {!notification.readStatus && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p
                          className={`text-gray-800 ${
                            !notification.readStatus ? "font-semibold" : ""
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: ko,
                            }
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
