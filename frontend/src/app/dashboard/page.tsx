"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import { Bar, Pie, PolarArea, Doughnut } from 'react-chartjs-2';
import styles from './page.module.css';
import InventoryTable from './inventory-table';
import { useRouter } from 'next/navigation';
import { useGlobalLoginUser } from '@/stores/auth/loginMember';

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

export default function DashboardPage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();
  
  // 권한 체크
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로그인 체크
        if (!isLogin) {
          router.replace('/login');
          return;
        }
        
        // 권한 체크
        if (!loginUser.role) {
          throw new Error('권한 정보가 없습니다.');
        }

        // 권한이 있는 경우 데이터 로드
        await fetchDashboardData();
        await fetchOutboundSummary();
      } catch (error) {
        console.error('권한 체크 중 오류 발생:', error);
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
        router.replace('/login');
      }
    };

    checkAuth();
  }, [isLogin, loginUser, router]);

  // 상태 관리
  const [categorySummary, setCategorySummary] = useState<Record<string, CategorySummary>>({});
  const [itemUsage, setItemUsage] = useState<ItemUsage[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [items, setItems] = useState<PageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockStatus, setStockStatus] = useState<StockStatus>({ 충분: 0, 적정: 0, 부족: 0 });
  const [outboundSummary, setOutboundSummary] = useState<OutboundSummary | null>(null);

  // 사용 가능한 년도 목록 계산
  const availableYears = useMemo(() => {
    const years = new Set(monthlySummary.map(item => parseInt(item.month.split('-')[0])));
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
        throw new Error('API URL이 설정되지 않았습니다.');
      }

      console.log('API URL:', API_URL); // API URL 로깅
      setIsLoading(true);
      
      // 공통 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const fetchOptions = {
        method: 'GET',
        credentials: 'include' as RequestCredentials,
        headers
      };

      // API 엔드포인트 목록
      const endpoints = {
        categorySummary: `${API_URL}/api/v1/analysis/category-summary`,
        itemUsage: `${API_URL}/api/v1/analysis/item-usage`,
        monthlySummary: `${API_URL}/api/v1/analysis/monthly-summary`,
        items: `${API_URL}/api/v1/items?page=0&size=100`
      };

      // 병렬로 API 호출
      const [categorySummaryRes, itemUsageRes, monthlySummaryRes, itemsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/analysis/category-summary`, {
          method: 'GET',
          credentials: 'include',  // 쿠키 포함
          headers
        }),
        fetch(`${API_URL}/api/v1/analysis/item-usage`, {
          method: 'GET',
          credentials: 'include',  // 쿠키 포함
          headers
        }),
        fetch(`${API_URL}/api/v1/analysis/monthly-summary`, {
          method: 'GET',
          credentials: 'include',  // 쿠키 포함
          headers
        }),
        fetch(`${API_URL}/api/v1/items?page=0&size=100`, {
          method: 'GET',
          credentials: 'include',
          headers
        })
      ]);

      // 응답 상태 코드 확인 및 자세한 에러 메시지 출력
      if (!categorySummaryRes.ok || !itemUsageRes.ok || !monthlySummaryRes.ok || !itemsRes.ok) {
        console.error('API 응답 상태:', {
          categorySummary: categorySummaryRes.status,
          itemUsage: itemUsageRes.status,
          monthlySummary: monthlySummaryRes.status,
          items: itemsRes.status
        });
        
        // 403 에러인 경우 로그인 페이지로 리다이렉트
        if (categorySummaryRes.status === 403 || itemUsageRes.status === 403 || 
            monthlySummaryRes.status === 403 || itemsRes.status === 403) {
          window.location.href = '/login';  // 또는 router.push('/login')
          throw new Error('로그인이 필요합니다.');
        }
        
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const [categoryData, usageData, monthlyData, itemsData] = await Promise.all([
        categorySummaryRes.json(),
        itemUsageRes.json(),
        monthlySummaryRes.json(),
        itemsRes.json()
      ]);

      setCategorySummary(categoryData);
      setItemUsage(usageData);
      setMonthlySummary(monthlyData);
      setItems(itemsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      console.error('대시보드 데이터 로딩 에러:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 년도의 데이터만 필터링
  const filteredMonthlyData = useMemo(() => {
    return monthlySummary
      .filter(item => parseInt(item.month.split('-')[0]) === selectedYear)
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlySummary, selectedYear]);

  // 재고 상태 계산
  const calculateStockStatus = () => {
    if (!items?.content) return;

    const status = { 충분: 0, 적정: 0, 부족: 0 };
    items.content.forEach(item => {
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
      if (!API_URL) throw new Error('API URL이 설정되지 않았습니다.');

      const response = await fetch(`${API_URL}/api/v1/analysis/outbound-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          router.replace('/login');
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setOutboundSummary(data);
    } catch (err) {
      console.error('아웃바운드 통계 로딩 에러:', err);
      if (err instanceof Error && err.message !== '로그인이 필요합니다.') {
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
    labels: filteredMonthlyData.map(item => {
      const [, month] = item.month.split('-');
      return `${month}월`;
    }),
    datasets: [
      {
        label: '입고량',
        data: filteredMonthlyData.map(item => item.inboundQuantity),
        backgroundColor: 'rgba(76, 110, 245, 0.7)',
      },
      {
        label: '출고량',
        data: filteredMonthlyData.map(item => item.outboundQuantity),
        backgroundColor: 'rgba(248, 113, 113, 0.7)',
      }
    ]
  };

  const usageChartData = {
    labels: itemUsage.map(item => item.itemName),
    datasets: [{
      data: itemUsage.map(item => item.usageCount),
      backgroundColor: [
        'rgba(76, 110, 245, 0.7)',
        'rgba(248, 113, 113, 0.7)',
        'rgba(251, 191, 36, 0.7)',
        'rgba(52, 211, 153, 0.7)',
        'rgba(129, 140, 248, 0.7)'
      ],
    }]
  };

  const categoryChartData = {
    labels: Object.keys(categorySummary),
    datasets: [{
      data: Object.values(categorySummary).map(item => item.totalQuantity),
      backgroundColor: [
        'rgba(76, 110, 245, 0.7)',
        'rgba(248, 113, 113, 0.7)',
        'rgba(251, 191, 36, 0.7)',
        'rgba(52, 211, 153, 0.7)',
        'rgba(129, 140, 248, 0.7)'
      ],
    }]
  };

  const stockStatusChartData = {
    labels: ['충분', '적정', '부족'],
    datasets: [{
      data: [stockStatus.충분, stockStatus.적정, stockStatus.부족],
      backgroundColor: [
        'rgba(52, 211, 153, 0.7)',  // 충분 - 초록
        'rgba(251, 191, 36, 0.7)',  // 적정 - 노랑
        'rgba(239, 68, 68, 0.7)',   // 부족 - 빨강
      ],
      borderColor: [
        'rgb(52, 211, 153)',
        'rgb(251, 191, 36)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1
    }]
  };

  // 아웃바운드 상태별 차트 데이터
  const outboundChartData = {
    labels: [
      '사용 가능',
      '분실',
      '지급',
      '대여',
      '수리',
      '폐기',
      '파손'
    ],
    datasets: [{
      data: outboundSummary ? [
        outboundSummary.AVAILABLE || 0,
        outboundSummary.LOST || 0,
        outboundSummary.ISSUE || 0,
        outboundSummary.LEND || 0,
        outboundSummary.REPAIR || 0,
        outboundSummary.DISPOSAL || 0,
        outboundSummary.DAMAGED || 0
      ] : [],
      backgroundColor: [
        'rgba(52, 211, 153, 0.8)',  // 사용 가능 - 초록
        'rgba(239, 68, 68, 0.8)',   // 분실 - 빨강
        'rgba(59, 130, 246, 0.8)',  // 지급 - 파랑
        'rgba(251, 191, 36, 0.8)',  // 대여 - 노랑
        'rgba(167, 139, 250, 0.8)', // 수리 - 보라
        'rgba(75, 85, 99, 0.8)',    // 폐기 - 회색
        'rgba(249, 115, 22, 0.8)',  // 파손 - 주황
      ],
      borderColor: [
        'rgb(52, 211, 153)',
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(251, 191, 36)',
        'rgb(167, 139, 250)',
        'rgb(75, 85, 99)',
        'rgb(249, 115, 22)',
      ],
      borderWidth: 1
    }]
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
            <p className={styles.statValue}>{Object.keys(categorySummary).length}개</p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>총 품목 수</h3>
            <p className={styles.statValue}>
              {Object.values(categorySummary).reduce((sum, item) => sum + item.itemTypeCount, 0)}개
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>총 재고 수량</h3>
            <p className={styles.statValue}>
              {Object.values(categorySummary).reduce((sum, item) => sum + item.totalQuantity, 0)}개
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>평균 사용 빈도</h3>
            <p className={styles.statValue}>
              {itemUsage.length > 0
                ? Math.round(itemUsage.reduce((sum, item) => sum + item.usageCount, 0) / itemUsage.length)
                : 0}회
            </p>
          </div>
        </div>

        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">월별 입출고량</h3>
              <div className="relative inline-block">
                <select
                  id="yearSelect"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                        position: 'top' as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                        position: 'right' as const,
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">아직 사용 기록이 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">비품 상태 현황</h3>
            </div>
            <div className={styles.chartContainer}>
              {outboundSummary && Object.values(outboundSummary).some(value => value > 0) ? (
                <Doughnut
                  data={outboundChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12
                          },
                          usePointStyle: true,
                          pointStyle: 'circle'
                        }
                      }
                    },
                    cutout: '60%'
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">아직 상태 정보가 없습니다</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">비품 수량 현황</h3>
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
                        position: 'right' as const,
                        labels: {
                          padding: 20,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
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
  const UserDashboard = () => (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>내 비품 현황</h1>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>대여 중인 비품</h3>
            <p className={styles.statValue}>
              {outboundSummary?.LEND || 0}개
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>지급받은 비품</h3>
            <p className={styles.statValue}>
              {outboundSummary?.ISSUE || 0}개
            </p>
          </div>
        </div>

        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>내 비품 상태</h3>
            <div className={styles.chartContainer}>
              {outboundSummary && (outboundSummary.LEND > 0 || outboundSummary.ISSUE > 0) ? (
                <Doughnut data={outboundChartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      labels: {
                        padding: 20,
                        font: {
                          size: 12
                        }
                      }
                    }
                  }
                }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-lg font-medium">데이터가 없습니다</p>
                  <p className="text-sm">아직 대여하거나 지급받은 비품이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <InventoryTable />
        </div>
      </div>
    </div>
  );

  // 권한에 따라 다른 대시보드 렌더링
  return (
    <>
      {(loginUser.role === 'ADMIN' || loginUser.role === 'MANAGER') ? (
        <ManagerDashboard />
      ) : (
        <UserDashboard />
      )}
    </>
  );
} 