"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Image from 'next/image';

type InboundType = 'PURCHASE' | 'RETURN' | 'REPAIR' | 'REPAIR_RETURN';

interface InboundItem {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
  inbound: InboundType;
  createdAt: string;
  image: string;
  categoryName: string;
}

interface PageInfo {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
}

interface InboundResponse {
  content: InboundItem[];
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

export default function InboundPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inboundType, setInboundType] = useState<InboundType | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [inboundData, setInboundData] = useState<InboundResponse | null>(null);
  const [filteredContent, setFilteredContent] = useState<InboundItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    if (!inboundData?.content) return [];
    const uniqueCategories = new Set(inboundData.content.map(item => item.categoryName));
    return Array.from(uniqueCategories);
  }, [inboundData?.content]);

  // 통계 데이터 계산 함수
  const calculateStats = (data: InboundItem[] | undefined) => {
    if (!data) return {
      total: 0,
      purchase: 0,
      return: 0,
      repair: 0,
      repairReturn: 0
    };

    return data.reduce((acc, item) => {
      acc.total += 1;
      switch (item.inbound) {
        case 'PURCHASE':
          acc.purchase += 1;
          break;
        case 'RETURN':
          acc.return += 1;
          break;
        case 'REPAIR':
          acc.repair += 1;
          break;
        case 'REPAIR_RETURN':
          acc.repairReturn += 1;
          break;
      }
      return acc;
    }, {
      total: 0,
      purchase: 0,
      return: 0,
      repair: 0,
      repairReturn: 0
    });
  };

  const inboundTypes = [
    { value: 'PURCHASE', label: '구매' },
    { value: 'RETURN', label: '반품' },
    { value: 'REPAIR', label: '수리' },
    { value: 'REPAIR_RETURN', label: '수리 반품' },
  ];

  const handleInboundTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInboundType(e.target.value as InboundType | '');
    setCurrentPage(1);
    setError(null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
    setError(null);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
    setCurrentPage(1);
  };

  const fetchInboundData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        size: String(pageSize),
      });

      if (inboundType) {
        queryParams.append('inbound', inboundType);
      }

      const response = await fetch(`${baseUrl}/api/v1/inventory-in?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: InboundResponse = await response.json();
      setInboundData(data);
      
      // 프론트엔드에서 날짜와 카테고리 필터링 수행
      if (data.content) {
        let filtered = data.content;

        // 날짜 필터링
        if (dateRange.start && dateRange.end) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.createdAt);
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            return itemDate >= start && itemDate <= end;
          });
        }

        // 카테고리 필터링
        if (selectedCategory) {
          filtered = filtered.filter(item => 
            item.categoryName === selectedCategory
          );
        }

        // 검색어 필터링
        if (searchKeyword.trim()) {
          const keyword = searchKeyword.toLowerCase().trim();
          filtered = filtered.filter(item =>
            item.itemName.toLowerCase().includes(keyword) ||
            item.categoryName.toLowerCase().includes(keyword) ||
            String(item.id).includes(keyword)
          );
        }

        setFilteredContent(filtered);
      }
    } catch (error) {
      console.error('Error fetching inbound data:', error);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      setInboundData(null);
      setFilteredContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 초기 데이터 로드
  useEffect(() => {
    fetchInboundData();
  }, []);  // 최초 1회만 실행

  // 필터나 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (inboundData) {  // 초기 데이터가 있을 때만 실행
      fetchInboundData();
    }
  }, [currentPage, pageSize, inboundType]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  // 엑셀 다운로드 함수 추가
  const handleExcelDownload = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/inventory-in/excel`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('엑셀 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `입고내역_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel download error:', error);
      setError('엑셀 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                입고 내역
              </h1>
              <p className="text-gray-600">
                비품의 입고 이력을 조회하고 관리할 수 있습니다.
              </p>
            </div>
            <button
              onClick={handleExcelDownload}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0047AB] hover:bg-[#003380] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] transition-colors duration-200 whitespace-nowrap"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              엑셀 다운로드
            </button>
          </div>

          {/* 통계 카드 섹션 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">전체 입고</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">{calculateStats(filteredContent).total}</span>
                <span className="text-xs text-gray-500">총 입고 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">구매</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">{calculateStats(filteredContent).purchase}</span>
                <span className="text-xs text-gray-500">신규 구매 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">반품</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">{calculateStats(filteredContent).return}</span>
                <span className="text-xs text-gray-500">반품 처리 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">수리</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">{calculateStats(filteredContent).repair}</span>
                <span className="text-xs text-gray-500">수리 중 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">수리 반품</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">{calculateStats(filteredContent).repairReturn}</span>
                <span className="text-xs text-gray-500">수리 완료 건수</span>
              </div>
            </div>
          </div>

          {/* 검색 / 필터 섹션 */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">상품명</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="상품명으로 검색"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">입고 유형</label>
                  <select
                    value={inboundType}
                    onChange={handleInboundTypeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    <option value="">전체</option>
                    {inboundTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    <option value="">전체</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기간 선택</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDateRange({ start: '', end: '' });
                      setSearchKeyword('');
                      setInboundType('');
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-[#003380] transition-colors duration-200 whitespace-nowrap h-[38px]"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">입고 유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">입고일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px] whitespace-nowrap">이미지</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : filteredContent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">표시할 입고 내역이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  filteredContent.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.itemName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.categoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.inbound === 'PURCHASE' ? 'bg-blue-100 text-blue-800' :
                          item.inbound === 'RETURN' ? 'bg-green-100 text-green-800' :
                          item.inbound === 'REPAIR' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {inboundTypes.find(type => type.value === item.inbound)?.label || item.inbound}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(item.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.image ? (
                          <button
                            onClick={() => setSelectedImage(item.image)}
                            className="text-[#0047AB] hover:text-[#003380] transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 이미지 모달 */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-black/50 hover:bg-black/70 p-2 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all duration-200 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex justify-center">
                <Image
                  src={selectedImage}
                  alt="비품 이미지"
                  width={800}
                  height={800}
                  className="max-h-[80vh] w-auto object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                    target.classList.add('opacity-50');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {inboundData && inboundData.totalPages > 0 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-6 py-2 text-gray-700">
                페이지 {currentPage} / {inboundData.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(inboundData.totalPages, currentPage + 1))}
                disabled={currentPage >= inboundData.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 