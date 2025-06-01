"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import { Bar, Pie, PolarArea, Doughnut } from "react-chartjs-2";
import styles from "./page.module.css";
import InventoryTable from "./inventory-table";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";
// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// 타입 정의
interface CategorySummary {
  totalQuantity: number;
  itemTypeCount: number;
}

interface ItemUsage {
  itemName: string;
  usageCount: number;
}

interface MonthlySummary {
  month: string;
  inboundQuantity: number;
  outboundQuantity: number;
}

interface StockStatus {
  충분: number;
  적정: number;
  부족: number;
}

interface Item {
  id: number;
  name: string;
  totalQuantity: number;
  minimumQuantity: number;
}

interface PageResponse {
  content: Item[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface OutboundSummary {
  AVAILABLE: number;
  LOST: number;
  ISSUE: number;
  LEND: number;
  REPAIR: number;
  DISPOSAL: number;
  DAMAGED: number;
}

interface SupplyRequest {
  id: number;
  productName: string;
  quantity: number;
  useDate: string;
  approvalStatus: "REQUESTED" | "APPROVED" | "REJECTED";
}

interface StatusCount {
  REQUESTED: number;
  APPROVED: number;
  REJECTED: number;
  RETURN_PENDING: number; // 반납 대기
  RETURNED: number; // 반납 완료
}

interface RentalItem {
  itemName: string;
  useDate: string;
  returnDate: string;
  rentStatus: "RENTING" | "OVERDUE" | "RETURNED";
}

interface Notification {
  id: number;
  message: string;
  notificationType:
    | "SUPPLY_REQUEST"
    | "SUPPLY_RETURN"
    | "STOCK_SHORTAGE"
    | "RETURN_DUE_DATE_EXCEEDED"
    | "NOT_RETURNED_YET"
    | "NEW_MANAGEMENT_DASHBOARD"
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
  createdAt: string;
  readStatus: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();
  const toast = useCustomToast();
  // 권한 체크
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로그인 체크
        if (!isLogin) {
          router.replace("/login");
          return;
        }

        // 권한 체크
        if (!loginUser.role) {
          throw new Error("권한 정보가 없습니다.");
        }

        // 권한이 있는 경우 데이터 로드
        await fetchDashboardData();
        await fetchOutboundSummary();
      } catch (error) {
        console.error("권한 체크 중 오류 발생:", error);
        if (
          error instanceof Error &&
          error.message.includes("Failed to fetch")
        ) {
          toast.error("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
        router.replace("/login");
      }
    };

    checkAuth();
  }, [isLogin, loginUser, router]);

  // 상태 관리
  const [categorySummary, setCategorySummary] = useState<
    Record<string, CategorySummary>
  >({});
  const [itemUsage, setItemUsage] = useState<ItemUsage[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [items, setItems] = useState<PageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockStatus, setStockStatus] = useState<StockStatus>({
    충분: 0,
    적정: 0,
    부족: 0,
  });
  const [outboundSummary, setOutboundSummary] =
    useState<OutboundSummary | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCount>({
    REQUESTED: 0,
    APPROVED: 0,
    REJECTED: 0,
    RETURN_PENDING: 0,
    RETURNED: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);

  // 사용 가능한 년도 목록 계산
  const availableYears = useMemo(() => {
    const years = new Set(
      monthlySummary.map((item) => parseInt(item.month.split("-")[0]))
    );
    return Array.from(years).sort((a, b) => b - a); // 내림차순 정렬
  }, [monthlySummary]);

  useEffect(() => {
    // 데이터가 로드되면 가장 최근 년도를 선택
    if (availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  // API 호출 함수
  const fetchDashboardData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!API_URL) {
        throw new Error("API URL이 설정되지 않았습니다.");
      }

      console.log("API URL:", API_URL); // API URL 로깅
      setIsLoading(true);

      // 공통 헤더 설정
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const fetchOptions = {
        method: "GET",
        credentials: "include" as RequestCredentials,
        headers,
      };

      // API 엔드포인트 목록
      const endpoints = {
        categorySummary: `${API_URL}/api/v1/analysis/category-summary`,
        itemUsage: `${API_URL}/api/v1/analysis/item-usage`,
        monthlySummary: `${API_URL}/api/v1/analysis/monthly-summary`,
        items: `${API_URL}/api/v1/items?page=0&size=5`,
      };

      // 병렬로 API 호출
      const [categorySummaryRes, itemUsageRes, monthlySummaryRes, itemsRes] =
        await Promise.all([
          fetch(`${API_URL}/api/v1/analysis/category-summary`, {
            method: "GET",
            credentials: "include", // 쿠키 포함
            headers,
          }),
          fetch(`${API_URL}/api/v1/analysis/item-usage`, {
            method: "GET",
            credentials: "include", // 쿠키 포함
            headers,
          }),
          fetch(`${API_URL}/api/v1/analysis/monthly-summary`, {
            method: "GET",
            credentials: "include", // 쿠키 포함
            headers,
          }),
          fetch(`${API_URL}/api/v1/items?page=0&size=5`, {
            method: "GET",
            credentials: "include",
            headers,
          }),
        ]);

      // 응답 상태 코드 확인 및 자세한 에러 메시지 출력
      if (
        !categorySummaryRes.ok ||
        !itemUsageRes.ok ||
        !monthlySummaryRes.ok ||
        !itemsRes.ok
      ) {
        console.error("API 응답 상태:", {
          categorySummary: categorySummaryRes.status,
          itemUsage: itemUsageRes.status,
          monthlySummary: monthlySummaryRes.status,
          items: itemsRes.status,
        });

        // 403 에러인 경우 로그인 페이지로 리다이렉트
        if (
          categorySummaryRes.status === 403 ||
          itemUsageRes.status === 403 ||
          monthlySummaryRes.status === 403 ||
          itemsRes.status === 403
        ) {
          window.location.href = "/"; // 또는 router.push('/login')
          throw new Error("로그인이 필요합니다.");
        }

        throw new Error("데이터를 불러오는데 실패했습니다.");
      }

      const [categoryData, usageData, monthlyData, itemsData] =
        await Promise.all([
          categorySummaryRes.json(),
          itemUsageRes.json(),
          monthlySummaryRes.json(),
          itemsRes.json(),
        ]);

      setCategorySummary(categoryData);
      setItemUsage(usageData);
      setMonthlySummary(monthlyData);
      setItems(itemsData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다."
      );
      console.error("대시보드 데이터 로딩 에러:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [myRequests, setMyRequests] = useState<SupplyRequestResponseDto[]>([]);
  const [isMyRequestsLoading, setIsMyRequestsLoading] = useState(true);
  const getRequestType = (rental: boolean) => (rental ? "대여" : "지급");

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        setIsMyRequestsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!API_URL) throw new Error("API URL이 설정되지 않았습니다.");

        const res = await fetch(`${API_URL}/api/v1/supply-requests/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("내 요청 내역을 불러오지 못했습니다.");

        const data = await res.json();
        // 최신순 정렬 후 5개만
        const sorted = data
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setMyRequests(sorted);
      } catch (e) {
        setMyRequests([]);
      } finally {
        setIsMyRequestsLoading(false);
      }
    };

    if (loginUser?.id) fetchMyRequests();
  }, [loginUser?.id]);

  // 선택된 년도의 데이터만 필터링
  const filteredMonthlyData = useMemo(() => {
    return monthlySummary
      .filter((item) => parseInt(item.month.split("-")[0]) === selectedYear)
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlySummary, selectedYear]);

  // 재고 상태 계산
  const calculateStockStatus = () => {
    if (!items?.content) return;

    const status = { 충분: 0, 적정: 0, 부족: 0 };
    items.content.forEach((item) => {
      const ratio = item.totalQuantity / item.minimumQuantity;
      if (ratio >= 2) status.충분++;
      else if (ratio >= 1) status.적정++;
      else status.부족++;
    });
    setStockStatus(status);
  };

  const fetchOutboundSummary = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!API_URL) throw new Error("API URL이 설정되지 않았습니다.");

      const response = await fetch(
        `${API_URL}/api/v1/analysis/outbound-summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          router.replace("/login");
          throw new Error("로그인이 필요합니다.");
        }
        throw new Error("데이터를 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setOutboundSummary(data);
    } catch (err) {
      console.error("아웃바운드 통계 로딩 에러:", err);
      if (err instanceof Error && err.message !== "로그인이 필요합니다.") {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    if (items?.content) {
      calculateStockStatus();
    }
  }, [items]);

  // 차트 데이터 준비
  const monthlyChartData = {
    labels: filteredMonthlyData.map((item) => {
      const [, month] = item.month.split("-");
      return `${month}월`;
    }),
    datasets: [
      {
        label: "입고량",
        data: filteredMonthlyData.map((item) => item.inboundQuantity),
        backgroundColor: "rgba(76, 110, 245, 0.7)",
      },
      {
        label: "출고량",
        data: filteredMonthlyData.map((item) => item.outboundQuantity),
        backgroundColor: "rgba(248, 113, 113, 0.7)",
      },
    ],
  };

  const usageChartData = {
    labels: itemUsage.map((item) => item.itemName),
    datasets: [
      {
        data: itemUsage.map((item) => item.usageCount),
        backgroundColor: [
          "rgba(76, 110, 245, 0.7)",
          "rgba(248, 113, 113, 0.7)",
          "rgba(251, 191, 36, 0.7)",
          "rgba(52, 211, 153, 0.7)",
          "rgba(129, 140, 248, 0.7)",
        ],
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categorySummary),
    datasets: [
      {
        data: Object.values(categorySummary).map((item) => item.totalQuantity),
        backgroundColor: [
          "rgba(76, 110, 245, 0.7)",
          "rgba(248, 113, 113, 0.7)",
          "rgba(251, 191, 36, 0.7)",
          "rgba(52, 211, 153, 0.7)",
          "rgba(129, 140, 248, 0.7)",
        ],
      },
    ],
  };

  const stockStatusChartData = {
    labels: ["충분", "적정", "부족"],
    datasets: [
      {
        data: [stockStatus.충분, stockStatus.적정, stockStatus.부족],
        backgroundColor: [
          "rgba(52, 211, 153, 0.7)", // 충분 - 초록
          "rgba(251, 191, 36, 0.7)", // 적정 - 노랑
          "rgba(239, 68, 68, 0.7)", // 부족 - 빨강
        ],
        borderColor: [
          "rgb(52, 211, 153)",
          "rgb(251, 191, 36)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // 아웃바운드 상태별 차트 데이터
  const outboundChartData = {
    labels: ["사용 가능", "분실", "지급", "대여", "수리", "폐기", "파손"],
    datasets: [
      {
        data: outboundSummary
          ? [
              outboundSummary.AVAILABLE || 0,
              outboundSummary.LOST || 0,
              outboundSummary.ISSUE || 0,
              outboundSummary.LEND || 0,
              outboundSummary.REPAIR || 0,
              outboundSummary.DISPOSAL || 0,
              outboundSummary.DAMAGED || 0,
            ]
          : [],
        backgroundColor: [
          "rgba(52, 211, 153, 0.8)", // 사용 가능 - 초록
          "rgba(239, 68, 68, 0.8)", // 분실 - 빨강
          "rgba(59, 130, 246, 0.8)", // 지급 - 파랑
          "rgba(251, 191, 36, 0.8)", // 대여 - 노랑
          "rgba(167, 139, 250, 0.8)", // 수리 - 보라
          "rgba(75, 85, 99, 0.8)", // 폐기 - 회색
          "rgba(249, 115, 22, 0.8)", // 파손 - 주황
        ],
        borderColor: [
          "rgb(52, 211, 153)",
          "rgb(239, 68, 68)",
          "rgb(59, 130, 246)",
          "rgb(251, 191, 36)",
          "rgb(167, 139, 250)",
          "rgb(75, 85, 99)",
          "rgb(249, 115, 22)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // 승인 상태에 따른 배지 스타일
  const getStatusBadgeStyle = (status: SupplyRequest["approvalStatus"]) => {
    switch (status) {
      case "REQUESTED":
        return "bg-orange-500";
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // 승인 상태 한글 변환
  const getStatusText = (status: SupplyRequest["approvalStatus"]) => {
    switch (status) {
      case "REQUESTED":
        return "승인 대기중";
      case "APPROVED":
        return "승인됨";
      case "REJECTED":
        return "거부됨";
      default:
        return "알 수 없음";
    }
  };

  // 알림 데이터 가져오기
  const fetchNotifications = async () => {
    try {
      setIsNotificationsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!API_URL) throw new Error("API URL이 설정되지 않았습니다.");

      const response = await fetch(
        `${API_URL}/api/v1/notifications?page=0&size=4`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("알림을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("알림 데이터:", data); // 디버깅을 위한 로그 추가

      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        console.error("알림 데이터 형식이 올바르지 않습니다:", data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("알림 로딩 에러:", error);
      setNotifications([]);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      fetchNotifications();
    }
  }, [isLogin]);

  // 알림 타입에 따른 스타일과 텍스트
  const getNotificationStyle = (type: Notification["notificationType"]) => {
    const baseStyle =
      "rounded-lg p-2.5 mb-1 flex items-center shadow-sm border hover:shadow-md transition-all duration-200";
    const iconBaseStyle = "w-5 h-5 mr-2 flex-shrink-0";

    switch (type) {
      case "SUPPLY_REQUEST":
      case "NEW_MANAGEMENT_DASHBOARD":
        return {
          containerStyle: `${baseStyle} bg-blue-50 border-blue-200 hover:bg-blue-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-blue-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          ),
        };
      case "STOCK_SHORTAGE":
        return {
          containerStyle: `${baseStyle} bg-red-50 border-red-200 hover:bg-red-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-red-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
        };
      case "RETURN_DUE_DATE_EXCEEDED":
      case "RETURN_DUE_SOON":
        return {
          containerStyle: `${baseStyle} bg-yellow-50 border-yellow-200 hover:bg-yellow-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-yellow-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "SUPPLY_REQUEST_APPROVED":
      case "SUPPLY_RETURN_APPROVED":
      case "NEW_USER_APPROVED":
        return {
          containerStyle: `${baseStyle} bg-green-50 border-green-200 hover:bg-green-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-green-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "SUPPLY_REQUEST_REJECTED":
      case "NEW_USER_REJECTED":
        return {
          containerStyle: `${baseStyle} bg-red-50 border-red-200 hover:bg-red-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-red-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      case "NEW_CHAT":
        return {
          containerStyle: `${baseStyle} bg-purple-50 border-purple-200 hover:bg-purple-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-purple-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
        };
      default:
        return {
          containerStyle: `${baseStyle} bg-gray-50 border-gray-200 hover:bg-gray-100`,
          icon: (
            <svg
              className={`${iconBaseStyle} text-gray-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
    }
  };

  // 상대적 시간 표시 함수
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">에러가 발생했습니다</p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // Manager 대시보드 뷰
  const ManagerDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>관리자 대시보드</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">↻</span>
              새로고침
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>총 카테고리</h3>
            <p className={styles.statValue}>
              {Object.keys(categorySummary).length}개
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>총 품목 수</h3>
            <p className={styles.statValue}>
              {Object.values(categorySummary).reduce(
                (sum, item) => sum + item.itemTypeCount,
                0
              )}
              개
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>총 재고 수량</h3>
            <p className={styles.statValue}>
              {Object.values(categorySummary).reduce(
                (sum, item) => sum + item.totalQuantity,
                0
              )}
              개
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>평균 사용 빈도</h3>
            <p className={styles.statValue}>
              {itemUsage.length > 0
                ? Math.round(
                    itemUsage.reduce((sum, item) => sum + item.usageCount, 0) /
                      itemUsage.length
                  )
                : 0}
              회
            </p>
          </div>
        </div>

        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                월별 입출고량
              </h3>
              <div className="relative inline-block">
                <select
                  id="yearSelect"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className={styles.chartContainer}>
              {monthlySummary.length > 0 ? (
                <Bar
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.05)",
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">아직 입출고 기록이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>품목별 사용 빈도</h3>
            <div className={styles.chartContainer}>
              {itemUsage.length > 0 ? (
                <Pie
                  data={usageChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right" as const,
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">아직 사용 기록이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                비품 상태 현황
              </h3>
            </div>
            <div className={styles.chartContainer}>
              {outboundSummary &&
              Object.values(outboundSummary).some((value) => value > 0) ? (
                <Doughnut
                  data={outboundChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right" as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                          },
                          usePointStyle: true,
                          pointStyle: "circle",
                        },
                      },
                    },
                    cutout: "60%",
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">아직 상태 정보가 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                비품 수량 현황
              </h3>
            </div>
            <div className={styles.chartContainer}>
              {Object.keys(categorySummary).length > 0 ? (
                <PolarArea
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right" as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">등록된 카테고리가 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 비품 목록 테이블 추가 */}
        <div className="mt-6">
          <InventoryTable />
        </div>
      </div>
    </div>
  );

  // 일반 사용자 대시보드 뷰
  const UserDashboard = () => {
    const [userRequests, setUserRequests] = useState<SupplyRequest[]>([]);
    const [recommendedItems, setRecommendedItems] = useState<
      Array<{ id: number; name: string; emoji: string }>
    >([]);
    const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
    const [statusCounts, setStatusCounts] = useState<StatusCount>({
      REQUESTED: 0,
      APPROVED: 0,
      REJECTED: 0,
      RETURN_PENDING: 0,
      RETURNED: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    useEffect(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
          if (!API_URL) throw new Error("API URL이 설정되지 않았습니다.");

          // 대여 물품 API 호출
          const rentalResponse = await fetch(
            `${API_URL}/api/v1/supply-requests/${loginUser?.id}/lent-items?page=${currentPage}&size=${pageSize}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              credentials: "include",
            }
          );

          if (!rentalResponse.ok) {
            throw new Error("대여 물품을 불러오는데 실패했습니다.");
          }

          const rentalData = await rentalResponse.json();

          if (isMounted) {
            setRentalItems(
              rentalData.content.map((item: any) => ({
                itemName: item.itemName,
                useDate: item.useDate,
                returnDate: item.returnDate,
                rentStatus: item.rentStatus,
              }))
            );
            setTotalPages(rentalData.totalPages);
          }

          // 추천 비품 API 호출 추가
          const recommendResponse = await fetch(
            `${API_URL}/api/v1/recommend?userId=${loginUser?.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              credentials: "include",
            }
          );

          if (!recommendResponse.ok) {
            throw new Error("추천 비품을 불러오는데 실패했습니다.");
          }

          const recommendData = await recommendResponse.json();

          // 이모지 매핑 함수
          const getEmoji = (itemName: string) => {
            const emojiMap: { [key: string]: string } = {
              용지: "📄",
              볼펜: "🖋️",
              포스트잇: "📊",
              프린터: "🖨️",
              클립: "🖇️",
              멀티탭: "🔌",
              마우스: "🖱️",
              키보드: "⌨️",
              모니터: "🖥️",
              노트북: "💻",
              의자: "🪑",
              책상: "🪑",
            };

            const matchedKey = Object.keys(emojiMap).find((key) =>
              itemName.toLowerCase().includes(key.toLowerCase())
            );
            return matchedKey ? emojiMap[matchedKey] : "📦";
          };

          if (isMounted) {
            setRecommendedItems(
              recommendData.map((item: any) => ({
                id: item.id,
                name: item.name,
                emoji: getEmoji(item.name),
              }))
            );
          }

          // 두 API 호출을 병렬로 처리
          const [statusResponse, requestsResponse] = await Promise.all([
            fetch(
              `${API_URL}/api/v1/supply-requests/status-count/${loginUser?.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                credentials: "include",
              }
            ),
            fetch(`${API_URL}/api/v1/supply-requests/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              credentials: "include",
            }),
          ]);

          if (!isMounted) return;

          if (
            statusResponse.status === 403 ||
            requestsResponse.status === 403
          ) {
            router.replace("/login");
            return;
          }

          if (!statusResponse.ok || !requestsResponse.ok) {
            throw new Error("데이터를 불러오는데 실패했습니다.");
          }

          const [statusData, requestsData] = await Promise.all([
            statusResponse.json(),
            requestsResponse.json(),
          ]);

          if (!isMounted) return;

          setStatusCounts({
            REQUESTED: statusData.REQUESTED || 0,
            APPROVED: statusData.APPROVED || 0,
            REJECTED: statusData.REJECTED || 0,
            RETURN_PENDING: statusData.RETURN_PENDING || 0,
            RETURNED: statusData.RETURNED || 0,
          });

          // 날짜 기준으로 정렬하여 최신 5개만 선택
          const sortedRequests = requestsData
            .sort((a: SupplyRequest, b: SupplyRequest) => {
              const dateA = new Date(a.useDate).getTime() || 0;
              const dateB = new Date(b.useDate).getTime() || 0;
              return dateB - dateA;
            })
            .slice(0, 5);

          setUserRequests(sortedRequests);
        } catch (error) {
          console.error("데이터 로딩 중 오류 발생:", error);
          if (
            error instanceof Error &&
            error.message === "사용자 정보가 없습니다."
          ) {
            router.replace("/login");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [loginUser?.id, router, currentPage]); // currentPage 의존성 추가

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    // 대여 상태에 따른 스타일과 텍스트
    const getRentalStatusStyle = (status: RentalItem["rentStatus"]) => {
      switch (status) {
        case "RENTING":
          return {
            bgColor: "bg-blue-50",
            textColor: "text-blue-700",
            hoverBg: "group-hover:bg-blue-100",
            text: "대여중",
          };
        case "OVERDUE":
          return {
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            hoverBg: "group-hover:bg-red-100",
            text: "연체",
          };
        case "RETURNED":
          return {
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            hoverBg: "group-hover:bg-green-100",
            text: "반납완료",
          };
        default:
          return {
            bgColor: "bg-gray-50",
            textColor: "text-gray-700",
            hoverBg: "group-hover:bg-gray-100",
            text: "알 수 없음",
          };
      }
    };
    const getRequestType = (rental: boolean) => (rental ? "대여" : "지급");

    // 날짜 포맷 함수
    const formatDate = (dateString: string) => {
      try {
        if (!dateString) return "-";

        // ISO 8601 형식의 날짜 문자열인지 확인
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
          // YYYY-MM-DD 형식으로 들어오는 경우
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString.split("-").join(". ") + ".";
          }
          return dateString;
        }

        const date = new Date(dateString);

        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
          console.error("Invalid date:", dateString);
          return "-";
        }

        return date
          .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\s/g, "");
      } catch (error) {
        console.error("Date formatting error:", error);
        return "-";
      }
    };

    return (
      <div className="max-w-[1536px] mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">대시보드</h1>
          <button
            onClick={() => router.push("/item/supplyrequest/create")}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-lg">+</span>새 물품 요청하기
          </button>
        </div>

        {/* 비품 요청 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm col-span-full">
            <h2 className="text-xl font-semibold mb-6">비품 요청 현황</h2>
            <div className="grid grid-cols-5 gap-4">
              {/* 승인 대기중 */}
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3 border-4 border-orange-200">
                  <span className="text-xl font-bold text-orange-600">
                    {statusCounts.REQUESTED}
                  </span>
                </div>
                <span className="text-sm font-medium text-orange-900">
                  승인 대기중
                </span>
                <span className="text-xs text-orange-600 mt-1">Pending</span>
              </div>

              {/* 승인됨 */}
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3 border-4 border-green-200">
                  <span className="text-xl font-bold text-green-600">
                    {statusCounts.APPROVED}
                  </span>
                </div>
                <span className="text-sm font-medium text-green-900">
                  승인됨
                </span>
                <span className="text-xs text-green-600 mt-1">Approved</span>
              </div>

              {/* 거부됨 */}
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3 border-4 border-red-200">
                  <span className="text-xl font-bold text-red-600">
                    {statusCounts.REJECTED}
                  </span>
                </div>
                <span className="text-sm font-medium text-red-900">거부됨</span>
                <span className="text-xs text-red-600 mt-1">Rejected</span>
              </div>

              {/* 반납 대기 */}
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-3 border-4 border-yellow-200">
                  <span className="text-xl font-bold text-yellow-600">
                    {statusCounts.RETURN_PENDING}
                  </span>
                </div>
                <span className="text-sm font-medium text-yellow-900">
                  반납 대기
                </span>
                <span className="text-xs text-yellow-600 mt-1">
                  Return Pending
                </span>
              </div>

              {/* 반납 완료 */}
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 border-4 border-blue-200">
                  <span className="text-xl font-bold text-blue-600">
                    {statusCounts.RETURNED}
                  </span>
                </div>
                <span className="text-sm font-medium text-blue-900">
                  반납 완료
                </span>
                <span className="text-xs text-blue-600 mt-1">Returned</span>
              </div>
            </div>
          </div>

          {/* 알림 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">알림</h2>
            <div className="space-y-4">
              {isNotificationsLoading ? (
                // 로딩 상태 표시
                Array(3)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex items-start gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="w-3 h-3 rounded-full bg-gray-200 mt-1.5"></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                      </div>
                    </div>
                  ))
              ) : notifications && notifications.length > 0 ? (
                notifications.map((notification) => {
                  const { containerStyle, icon } = getNotificationStyle(
                    notification.notificationType
                  );
                  return (
                    <div key={notification.id} className={containerStyle}>
                      {icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.readStatus && (
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-2 flex-shrink-0"></span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>새로운 알림이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 자주 요청하는 비품 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              사용자 맞춤 추천 비품
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {isLoading ? (
                // 로딩 상태 표시
                Array(6)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-lg text-center animate-pulse"
                    >
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                  ))
              ) : recommendedItems.length > 0 ? (
                recommendedItems.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(
                        `/item/supplyrequest/create?itemId=${item.id}`
                      )
                    }
                    className="bg-gray-50 p-3 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-all duration-300"
                  >
                    <span className="text-2xl mb-2 block">{item.emoji}</span>
                    <span className="text-sm line-clamp-1">{item.name}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <p>추천 비품이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 사용자 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">사용자 정보</h2>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {loginUser?.name || "사용자"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {loginUser?.email || "이메일 정보 없음"}
              </p>
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">권한</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loginUser?.role === "MANAGER"
                      ? "매니저"
                      : loginUser?.role === "USER"
                      ? "일반 사용자"
                      : "관리자"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">관리자 페이지</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loginUser?.managementDashboardName || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">부서</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loginUser?.departmentName || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 요청 내역과 개인 대여 물품 관리를 감싸는 그리드 컨테이너 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 요청 내역 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
                  최근 요청 내역
                </h2>
                <p className="text-gray-400 text-sm font-medium">
                  최근 5건의 비품 요청 현황입니다.
                </p>
              </div>
            </div>
            {isMyRequestsLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-blue-600"></div>
              </div>
            ) : myRequests.length > 0 ? (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-xl shadow-sm px-6 py-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                        <span className="text-xl font-bold text-blue-600">
                          📋
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-gray-900 truncate max-w-[120px]">
                            {req.productName}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            × {req.quantity}
                          </span>
                          <span
                            className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      req.approvalStatus === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : req.approvalStatus === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  `}
                          >
                            {getStatusText(req.approvalStatus)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                          <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
                            {getRequestType(req.rental)}
                          </span>
                          <span>
                            작성일:{" "}
                            <span className="font-semibold text-gray-700">
                              {formatDate(req.createdAt)}
                            </span>
                          </span>
                          <span>
                            반납일:{" "}
                            <span className="font-semibold text-gray-700">
                              {req.returnDate
                                ? formatDate(req.returnDate)
                                : "-"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center shadow">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold">요청 내역이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">
                  새로운 비품을 요청해보세요
                </p>
              </div>
            )}
          </div>

          {/* 개인 대여 물품 관리 */}
          <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  개인 대여 물품 관리
                </h2>
                <p className="text-gray-500 text-sm">
                  현재 대여중인 물품과 반납 예정일을 확인하세요.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex items-center justify-between p-5 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-48"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
              </div>
            ) : rentalItems.length > 0 ? (
              <div className="space-y-4">
                {rentalItems.map((item, index) => {
                  const status = getRentalStatusStyle(item.rentStatus);
                  return (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300 ease-in-out"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                            <span className="text-2xl">📦</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors duration-300">
                            {item.itemName}
                          </h3>
                          <div className="flex space-x-4 text-sm text-gray-500">
                            <span>대여일: {formatDate(item.useDate)}</span>
                            <span>
                              반납예정일: {formatDate(item.returnDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                          ${status.bgColor} ${status.textColor} ${status.hoverBg}
                        `}
                        >
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium">대여중인 물품이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">
                  새로운 물품을 대여해보세요
                </p>
              </div>
            )}

            {/* 페이지네이션 */}
            {!isLoading && rentalItems.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`
                      px-3 py-1 rounded-md text-sm font-medium transition-colors
                      ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }
                    `}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 권한에 따라 다른 대시보드 렌더링
  return (
    <>
      {loginUser.role === "ADMIN" || loginUser.role === "MANAGER" ? (
        <ManagerDashboard />
      ) : (
        <UserDashboard />
      )}
    </>
  );
}
