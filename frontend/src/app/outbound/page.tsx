"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface OutboundItem {
  id: number;
  supplyRequestId: number;
  itemId: number;
  categoryId: number;
  managementId: number;
  quantity: number;
  outbound: string;
  createdAt: string;
  modifiedAt: string;
  categoryName: string;
  itemName: string;
}

interface PageInfo {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
}

interface OutboundResponse {
  content: OutboundItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
}

export default function OutboundPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedOutboundType, setSelectedOutboundType] = useState<string>('');
  const [outboundData, setOutboundData] = useState<OutboundResponse | null>(null);
  const [filteredContent, setFilteredContent] = useState<OutboundItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    if (!outboundData?.content) return [];
    const uniqueCategories = new Set(outboundData.content.map(item => item.categoryName));
    return Array.from(uniqueCategories);
  }, [outboundData?.content]);

  const outboundTypes = [
    { value: 'ISSUE', label: '지급' },
    { value: 'LOST', label: '분실' },
    { value: 'LEND', label: '대여' },
    { value: 'REPAIR', label: '수리' },
    { value: 'DISPOSAL', label: '폐기' },
    { value: 'DAMAGED', label: '파손' },
  ];

  // 통계 데이터 계산 함수
  const calculateStats = (data: OutboundItem[] | undefined) => {
    if (!data) return {
      total: 0,
      issue: 0,
      lost: 0,
      lend: 0,
      repair: 0,
      disposal: 0,
      damaged: 0
    };

    return data.reduce((acc, item) => {
      acc.total += 1;
      switch (item.outbound) {
        case 'ISSUE':
          acc.issue += 1;
          break;
        case 'LOST':
          acc.lost += 1;
          break;
        case 'LEND':
          acc.lend += 1;
          break;
        case 'REPAIR':
          acc.repair += 1;
          break;
        case 'DISPOSAL':
          acc.disposal += 1;
          break;
        case 'DAMAGED':
          acc.damaged += 1;
          break;
      }
      return acc;
    }, {
      total: 0,
      issue: 0,
      lost: 0,
      lend: 0,
      repair: 0,
      disposal: 0,
      damaged: 0
    });
  };

  // 출고 유형 표시 함수
  const getOutboundType = (type: string) => {
    switch (type) {
      case 'ISSUE':
        return { text: '지급', className: 'bg-emerald-50 text-emerald-700' };
      case 'LOST':
        return { text: '분실', className: 'bg-red-50 text-red-700' };
      case 'LEND':
        return { text: '대여', className: 'bg-blue-50 text-blue-700' };
      case 'REPAIR':
        return { text: '수리', className: 'bg-purple-50 text-purple-700' };
      case 'DISPOSAL':
        return { text: '폐기', className: 'bg-gray-50 text-gray-700' };
      case 'DAMAGED':
        return { text: '파손', className: 'bg-amber-50 text-amber-700' };
      default:
        return { text: '알 수 없음', className: 'bg-gray-50 text-gray-700' };
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(0);
    setError(null);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(0);
  };

  const handleOutboundTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutboundType(e.target.value);
    setCurrentPage(0);
    setError(null);
  };

  const fetchOutboundData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        size: String(pageSize),
        search: searchKeyword,
        fromDate: dateRange.start,
        toDate: dateRange.end,
      });

      const response = await fetch(`${baseUrl}/api/v1/inventory-out?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OutboundResponse = await response.json();
      setOutboundData(data);
      
      // 프론트엔드에서 필터링 수행
      if (data.content) {
        let filtered = data.content;

        // 카테고리 필터링
        if (selectedCategory) {
          filtered = filtered.filter(item => 
            item.categoryName === selectedCategory
          );
        }

        // 출고 유형 필터링
        if (selectedOutboundType) {
          filtered = filtered.filter(item =>
            item.outbound === selectedOutboundType
          );
        }

        // 검색어 필터링
        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase().trim();
          filtered = filtered.filter(item =>
            item.itemName.toLowerCase().includes(keyword) ||
            item.categoryName.toLowerCase().includes(keyword) ||
            String(item.id).includes(keyword) ||
            String(item.supplyRequestId).includes(keyword)
          );
        }

        setFilteredContent(filtered);
      }
    } catch (error) {
      console.error('Error fetching outbound data:', error);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      setOutboundData(null);
      setFilteredContent([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchKeyword, dateRange.start, dateRange.end, selectedCategory, selectedOutboundType]);

  // 페이지 로드 시 초기 데이터 로드
  useEffect(() => {
    fetchOutboundData();
  }, [
    currentPage,
    pageSize,
    dateRange.start,
    dateRange.end,
    searchKeyword,
    selectedCategory,
    selectedOutboundType,
    fetchOutboundData
  ]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  // 엑셀 다운로드
  const downloadExcel = async () => {
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const ep = "/api/v1/inventory-out/export";
      const params = new URLSearchParams({
        fromDate: dateRange.start,
        toDate: dateRange.end,
        search: searchKeyword,
      });
      const url = `${baseUrl}${ep}?${params}`;
      
      const response = await fetch(url, { 
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `출고내역_${dateRange.start}_to_${dateRange.end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch (error) {
      console.error('Excel download error:', error);
      setError("엑셀 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">출고 내역</h1>
          <p className="text-gray-500">비품의 출고 현황을 확인할 수 있습니다.</p>
        </div>
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          엑셀 다운로드
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-slate-500 text-sm font-medium mb-4">전체 출고</div>
            <div className="text-4xl font-semibold text-slate-700 mb-1">{filteredContent.length}</div>
            <div className="text-xs text-slate-400 font-medium">총 출고 건수</div>
          </div>
        </div>

        <div className="bg-emerald-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-emerald-600 text-sm font-medium mb-4">지급/대여</div>
            <div className="text-4xl font-semibold text-emerald-700 mb-1">
              {calculateStats(filteredContent).issue + calculateStats(filteredContent).lend}
            </div>
            <div className="text-xs text-emerald-500 font-medium">지급 {calculateStats(filteredContent).issue} | 대여 {calculateStats(filteredContent).lend}</div>
          </div>
        </div>

        <div className="bg-red-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-red-600 text-sm font-medium mb-4">분실/파손</div>
            <div className="text-4xl font-semibold text-red-700 mb-1">
              {calculateStats(filteredContent).lost + calculateStats(filteredContent).damaged}
            </div>
            <div className="text-xs text-red-500 font-medium">분실 {calculateStats(filteredContent).lost} | 파손 {calculateStats(filteredContent).damaged}</div>
          </div>
        </div>

        <div className="bg-purple-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-purple-600 text-sm font-medium mb-4">수리/폐기</div>
            <div className="text-4xl font-semibold text-purple-700 mb-1">
              {calculateStats(filteredContent).repair + calculateStats(filteredContent).disposal}
            </div>
            <div className="text-xs text-purple-500 font-medium">수리 {calculateStats(filteredContent).repair} | 폐기 {calculateStats(filteredContent).disposal}</div>
          </div>
        </div>
      </div>

      {/* 검색 필터 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">출고 일자</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                max={dateRange.end}
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={dateRange.start}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">카테고리</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">전체</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">출고 유형</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedOutboundType}
              onChange={handleOutboundTypeChange}
            >
              <option value="">전체</option>
              {outboundTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              placeholder="품목명, 카테고리, ID 검색"
              className="border border-gray-200 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(0);
                  fetchOutboundData();
                }
              }}
            />
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                setCurrentPage(0);
                fetchOutboundData();
              }}
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">출고ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">요청서ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">출고 일자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">품목명</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">수량</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">출고 유형</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm text-gray-600">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.supplyRequestId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.itemName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getOutboundType(item.outbound).className}`}
                    >
                      {getOutboundType(item.outbound).text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            총 {outboundData?.totalElements || 0}개의 결과
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-lg border border-gray-200 ${
                currentPage === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              이전
            </button>
            {Array.from({ length: Math.min(5, outboundData?.totalPages || 1) }, (_, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setCurrentPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className={`px-4 py-2 rounded-lg border border-gray-200 ${
                currentPage === (outboundData?.totalPages || 1) - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setCurrentPage(prev => Math.min((outboundData?.totalPages || 1) - 1, prev + 1))}
              disabled={currentPage === (outboundData?.totalPages || 1) - 1}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 