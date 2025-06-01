"use client";

import React, { useEffect, useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNotificationStore } from "@/stores/notifications";
import { useCustomToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

type NotificationType =
  | "SUPPLY_REQUEST"
  | "SUPPLY_RETURN"
  | "STOCK_SHORTAGE"
  | "RETURN_DUE_DATE_EXCEEDED"
  | "NOT_RETURNED_YET"
  // | "NEW_MANAGEMENT_DASHBOARD"
  | "ADMIN_APPROVAL_ALERT"
  | "ADMIN_REJECTION_ALERT"
  | "NEW_MANAGER"
  | "MANAGER_APPROVAL_ALERT"
  | "MANAGER_REJECTION_ALERT"
  | "NEW_USER"
  | "SUPPLY_REQUEST_APPROVED"
  | "SUPPLY_REQUEST_REJECTED"
  | "SUPPLY_REQUEST_DELAYED"
  | "RETURN_DUE_SOON"
  | "NEW_CHAT"
  | "SUPPLY_RETURN_APPROVED"
  | "NEW_USER_APPROVED"
  | "NEW_USER_REJECTED";

type NotificationGroup = "IMPORTANT" | "OTHER";

const USER_NOTIFICATION_TYPES: NotificationType[] = [
  "SUPPLY_REQUEST_APPROVED",
  "SUPPLY_REQUEST_REJECTED",
  "SUPPLY_RETURN_APPROVED",
  "RETURN_DUE_SOON",
  "SUPPLY_REQUEST_DELAYED",
  "NEW_CHAT",
  "NEW_USER_APPROVED",
  "NEW_USER_REJECTED",
];

const MANAGER_NOTIFICATION_TYPES: NotificationType[] = [
  "SUPPLY_REQUEST",
  "SUPPLY_RETURN",
  "STOCK_SHORTAGE",
  "RETURN_DUE_DATE_EXCEEDED",
  "NOT_RETURNED_YET",
  // "NEW_MANAGEMENT_DASHBOARD",
  "ADMIN_APPROVAL_ALERT",
  "ADMIN_REJECTION_ALERT",
  "NEW_MANAGER",
  "MANAGER_APPROVAL_ALERT",
  "MANAGER_REJECTION_ALERT",
  "NEW_CHAT",
  "NEW_USER",
];

interface Notification {
  id: number;
  message: string;
  notificationType: NotificationType;
  createdAt: string;
  readStatus: boolean;
}

interface NotificationPageResponse {
  notifications: Notification[];
  totalElements: number;
  totalPages: number;
}

const NOTIFICATION_TYPE_LABELS: Record<
  NotificationType | "ALL" | "OTHER",
  { label: string; color: string; icon: React.ReactElement }
> = {
  ALL: {
    label: "전체",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  OTHER: {
    label: "기타 알림",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST: {
    label: "비품 요청",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_RETURN: {
    label: "비품 반납",
    color: "bg-blue-100 text-blue-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  STOCK_SHORTAGE: {
    label: "재고 부족",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_APPROVED: {
    label: "비품 요청 승인",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_REJECTED: {
    label: "비품 요청 반려",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_REQUEST_DELAYED: {
    label: "비품 요청 처리 지연",
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  RETURN_DUE_DATE_EXCEEDED: {
    label: "반납일 초과",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  RETURN_DUE_SOON: {
    label: "반납일 임박",
    color: "bg-yellow-100 text-yellow-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_CHAT: {
    label: "채팅",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  ADMIN_APPROVAL_ALERT: {
    label: "관리 페이지 승인",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  MANAGER_APPROVAL_ALERT: {
    label: "매니저 승인",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  MANAGER_REJECTION_ALERT: {
    label: "매니저 거절",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  ADMIN_REJECTION_ALERT: {
    label: "관리 페이지 생성 반려",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  SUPPLY_RETURN_APPROVED: {
    label: "비품 반납 승인",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  NOT_RETURNED_YET: {
    label: "장기 미반납 비품 목록",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_MANAGER: {
    label: "매니저 권한 요청",
    color: "bg-indigo-100 text-indigo-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  NEW_USER: {
    label: "새로운 회원",
    color: "bg-gray-100 text-gray-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_USER_APPROVED: {
    label: "회원 승인",
    color: "bg-green-100 text-green-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
  NEW_USER_REJECTED: {
    label: "회원 거부",
    color: "bg-red-100 text-red-800",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
      </svg>
    ),
  },
};

export default function NotificationsPage() {
  const { loginUser } = useGlobalLoginUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    []
  );
  const [selectedType, setSelectedType] = useState<
    NotificationType | "ALL" | "OTHER"
  >("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const pageSize = 10;
  const toast = useCustomToast();

  // 유저와 매니저에 따른 주요 알림 타입 정의
  const PRIMARY_NOTIFICATION_TYPES =
    loginUser.role === "MANAGER"
      ? [
          "SUPPLY_REQUEST",
          "SUPPLY_RETURN",
          "STOCK_SHORTAGE",
          "RETURN_DUE_DATE_EXCEEDED",
        ]
      : [
          "SUPPLY_REQUEST_APPROVED",
          "SUPPLY_REQUEST_REJECTED",
          "SUPPLY_RETURN_APPROVED",
        ];

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(showUnreadOnly && { unreadOnly: "true" }),
      });

      // 알림 타입 필터링 처리
      if (selectedType !== "ALL") {
        if (selectedType === "OTHER") {
          // 기타 알림 타입들을 제외한 나머지
          const otherTypes = (
            loginUser.role === "MANAGER"
              ? MANAGER_NOTIFICATION_TYPES
              : USER_NOTIFICATION_TYPES
          ).filter((type) => !PRIMARY_NOTIFICATION_TYPES.includes(type));
          if (otherTypes.length > 0) {
            params.append("types", otherTypes.join(","));
          }
        } else {
          params.append("type", selectedType);
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications?${params}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림 목록을 불러오는데 실패했습니다.");
      }

      const data: NotificationPageResponse = await response.json();

      // 프론트엔드에서 추가 필터링
      let filteredNotifications = data.notifications;
      if (selectedType === "OTHER") {
        const otherTypes = (
          loginUser.role === "MANAGER"
            ? MANAGER_NOTIFICATION_TYPES
            : USER_NOTIFICATION_TYPES
        ).filter((type) => !PRIMARY_NOTIFICATION_TYPES.includes(type));
        filteredNotifications = data.notifications.filter((notification) =>
          otherTypes.includes(notification.notificationType)
        );
      }

      setNotifications(filteredNotifications);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (loginUser.id) {
      fetchNotifications();
    }
  }, [loginUser.id, currentPage, selectedType, showUnreadOnly]);

  // BroadcastChannel 설정
  React.useEffect(() => {
    const channel = new BroadcastChannel("notifications");

    // 다른 탭에서 온 알림 수신
    channel.onmessage = (event) => {
      if (event.data.type === "MARK_AS_READ") {
        // 읽음 처리
        useNotificationStore.getState().markAsRead(event.data.notificationId);
      } else if (event.data.type === "MARK_ALL_AS_READ") {
        // 전체 읽음 처리
        useNotificationStore.getState().markAllAsRead();
      } else if (event.data.type === "NEW_NOTIFICATION") {
        // 새 알림 추가
        useNotificationStore.getState().addNotification(event.data.data);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const handleCheckboxChange = (notificationId: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      const markAsReadPromises = selectedNotifications.map((id) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/${id}/read`,
          {
            method: "PUT",
            credentials: "include",
          }
        ).then(async (response) => {
          if (response.ok) {
            // 각 알림의 상태를 스토어에서도 업데이트
            useNotificationStore.getState().markAsRead(id);

            // 다른 탭에 알림
            const channel = new BroadcastChannel("notifications");
            channel.postMessage({
              type: "MARK_AS_READ",
              notificationId: id,
            });
            channel.close();
          }
          return response;
        })
      );

      await Promise.all(markAsReadPromises);
      setSelectedNotifications([]);
      await fetchNotifications();
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
      toast.success("알림을 삭제했습니다.");

      fetchNotifications();
    } catch (err) {
      setError("알림 삭제 중 오류가 발생했습니다.");
    }
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
      toast.success("알림을 삭제했습니다.");
    } catch (err) {
      setError("알림 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/deleteAll`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("읽은 알림 삭제에 실패했습니다.");
      }
      toast.success("읽은 알림을 모두 삭제했습니다.");

      setShowDeleteConfirm(false);
      fetchNotifications();
    } catch (err) {
      setError("읽은 알림 삭제 중 오류가 발생했습니다.");
      toast.error("읽은 알림 삭제 중 오류가 발생했습니다.");
    }
  };

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
        toast.error("알림 상태 변경에 실패했습니다.");
      }
      toast.success("모든 알림을 읽음 처리했습니다.");

      // 알림 스토어의 상태도 업데이트
      useNotificationStore.getState().markAllAsRead();

      // 다른 탭에 알림
      const channel = new BroadcastChannel("notifications");
      channel.postMessage({
        type: "MARK_ALL_AS_READ",
      });
      channel.close();

      await fetchNotifications();
    } catch (err) {
      setError("알림 상태 변경 중 오류가 발생했습니다.");
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

      // 알림 스토어의 상태도 업데이트
      useNotificationStore.getState().markAsRead(notificationId);

      // 다른 탭에 알림
      const channel = new BroadcastChannel("notifications");
      channel.postMessage({
        type: "MARK_AS_READ",
        notificationId,
      });
      channel.close();

      await fetchNotifications();
    } catch (err) {
      setError("알림 상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 알림 라벨을 가져오는 함수
  const getNotificationLabel = (type: NotificationType) => {
    // PRIMARY_NOTIFICATION_TYPES에 포함된 알림만 원래 라벨 사용
    if (PRIMARY_NOTIFICATION_TYPES.includes(type)) {
      return NOTIFICATION_TYPE_LABELS[type];
    }
    // 나머지는 모두 공통 라벨 사용
    return {
      label: "알림",
      color: "bg-gray-100 text-gray-800",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V3z" />
        </svg>
      ),
    };
  };

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
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">알림 목록</h1>
          <div className="flex gap-2">
            {selectedNotifications.length > 0 ? (
              <>
                <button
                  onClick={handleMarkSelectedAsRead}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
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
                  선택 읽음 처리
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
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
                  선택 삭제
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
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
                  전체 읽음 처리
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
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
                  읽은 알림 삭제
                </button>
              </>
            )}
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                읽은 알림을 모두 삭제하시겠습니까?
              </h3>
              <p className="text-gray-600 mb-6">
                읽은 모든 알림이 영구적으로 삭제됩니다.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAllRead}
                  className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <span>
                  {selectedType === "ALL"
                    ? "전체"
                    : selectedType === "OTHER"
                    ? "기타 알림"
                    : getNotificationLabel(selectedType as NotificationType)
                        .label}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedType("ALL");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                        selectedType === "ALL" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      전체
                    </button>
                    {PRIMARY_NOTIFICATION_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedType(type as NotificationType);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                          selectedType === type
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        {getNotificationLabel(type as NotificationType).label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedType("OTHER");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                        selectedType === "OTHER"
                          ? "bg-blue-50 text-blue-600"
                          : ""
                      }`}
                    >
                      기타 알림
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 안 읽은 알림만 보기 체크박스 */}
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

            {/* 알림 개수 표시 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {totalElements}개의 알림
              </span>
              {selectedNotifications.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedNotifications.length}개 선택됨
                </span>
              )}
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            새로운 알림이 없습니다
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {notifications
                .sort((a, b) => {
                  if (a.readStatus !== b.readStatus) {
                    return a.readStatus ? 1 : -1;
                  }
                  return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                  );
                })
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg shadow p-4 ${
                      !notification.readStatus
                        ? "border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={() => {
                      // 알림 타입에 따라 다른 페이지로 이동
                      if (notification.notificationType === "SUPPLY_REQUEST") {
                        router.push("/item/supplyrequest/list/manage");
                      } else if (
                        notification.notificationType === "SUPPLY_RETURN"
                      ) {
                        router.push("/item/return");
                      } else if (
                        notification.notificationType === "STOCK_SHORTAGE"
                      ) {
                        router.push("/item/manage");
                      } else if (notification.notificationType === "NEW_USER") {
                        router.push("/settings/approve");
                      } else if (
                        notification.notificationType ===
                          "SUPPLY_REQUEST_APPROVED" ||
                        notification.notificationType ===
                          "SUPPLY_REQUEST_REJECTED" ||
                        notification.notificationType ===
                          "SUPPLY_REQUEST_DELAYED"
                      ) {
                        router.push("/item/supplyrequest/list/user");
                      } else if (
                        notification.notificationType === "NEW_MANAGER"
                      ) {
                        router.push("/settings/approve");
                      } else if (notification.notificationType === "NEW_CHAT") {
                        router.push("/chat/select");
                      } else if (
                        notification.notificationType === "RETURN_DUE_SOON"
                      ) {
                        router.push("/item/supplyreturn");
                      } else if (
                        notification.notificationType ===
                        "SUPPLY_RETURN_APPROVED"
                      ) {
                        router.push("/item/supplyreturn");
                      }

                      // 읽음 처리
                      if (!notification.readStatus) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onChange={() => handleCheckboxChange(notification.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0 cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-3 py-1 rounded-full inline-flex items-center gap-2 ${
                                  getNotificationLabel(
                                    notification.notificationType
                                  ).color
                                }`}
                              >
                                <span className="text-sm font-medium">
                                  {
                                    getNotificationLabel(
                                      notification.notificationType
                                    ).label
                                  }
                                </span>
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
                              {format(
                                new Date(notification.createdAt),
                                "yyyy년 MM월 dd일 HH:mm"
                              )}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
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

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="text-gray-600">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
