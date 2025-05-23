"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
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
        if (dateRange.start || dateRange.end) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.createdAt);
            const start = dateRange.start ? new Date(dateRange.start) : null;
            const end = dateRange.end ? new Date(dateRange.end) : null;
            
            if (start && end) {
              return itemDate >= start && itemDate <= end;
            } else if (start) {
              return itemDate >= start;
            } else if (end) {
              return itemDate <= end;
            }
            return true;
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
      return format(new Date(dateString), 'yyyy-MM-dd', { locale: ko });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">입고 내역</h1>
        <p className="text-gray-500">비품의 입고 현황을 확인할 수 있습니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <div className="bg-slate-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-slate-500 text-sm font-medium mb-4">전체 입고</div>
            <div className="text-4xl font-semibold text-slate-700 mb-1">{filteredContent.length}</div>
            <div className="text-xs text-slate-400 font-medium">총 입고 건수</div>
          </div>
        </div>

        <div className="bg-emerald-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-emerald-600 text-sm font-medium mb-4">구매</div>
            <div className="text-4xl font-semibold text-emerald-700 mb-1">
              {calculateStats(filteredContent).purchase}
            </div>
            <div className="text-xs text-emerald-500 font-medium">신규 구매 건수</div>
          </div>
        </div>

        <div className="bg-blue-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-blue-600 text-sm font-medium mb-4">반품</div>
            <div className="text-4xl font-semibold text-blue-700 mb-1">
              {calculateStats(filteredContent).return}
            </div>
            <div className="text-xs text-blue-500 font-medium">반품 처리 건수</div>
          </div>
        </div>

        <div className="bg-violet-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-violet-600 text-sm font-medium mb-4">수리</div>
            <div className="text-4xl font-semibold text-violet-700 mb-1">
              {calculateStats(filteredContent).repair}
            </div>
            <div className="text-xs text-violet-500 font-medium">수리 중 건수</div>
          </div>
        </div>

        <div className="bg-amber-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-amber-600 text-sm font-medium mb-4">수리 반품</div>
            <div className="text-4xl font-semibold text-amber-700 mb-1">
              {calculateStats(filteredContent).repairReturn}
            </div>
            <div className="text-xs text-amber-500 font-medium">수리 완료 건수</div>
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
        <div className="flex gap-6 items-center">
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">입고 일자</span>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              max={dateRange.end}
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              min={dateRange.start}
            />
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">입고 유형</span>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={inboundType}
              onChange={handleInboundTypeChange}
            >
              <option value="">전체</option>
              {inboundTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">카테고리</span>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex gap-3 items-center ml-auto">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              className="border border-gray-200 rounded-lg px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                setCurrentPage(1);
                fetchInboundData();
              }}
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50" 
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-lg w-[95vw] h-[95vh] relative" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <img 
                src={selectedImage} 
                alt="상세 이미지"
                style={{
                  minWidth: '50%',
                  minHeight: '50%',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">입고ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">입고 일자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">카테고리</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">품목명</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">수량</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">입고 유형</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">이미지</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm text-gray-600">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.itemName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${item.inbound === 'PURCHASE' ? 'bg-green-50 text-green-700' : ''}
                      ${item.inbound === 'RETURN' ? 'bg-blue-50 text-blue-700' : ''}
                      ${item.inbound === 'REPAIR' ? 'bg-purple-50 text-purple-700' : ''}
                      ${item.inbound === 'REPAIR_RETURN' ? 'bg-yellow-50 text-yellow-700' : ''}
                    `}
                    >
                      {item.inbound === 'PURCHASE' && '구매'}
                      {item.inbound === 'RETURN' && '반품'}
                      {item.inbound === 'REPAIR' && '수리'}
                      {item.inbound === 'REPAIR_RETURN' && '수리 반품'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.image ? (
                      <button
                        onClick={() => setSelectedImage(item.image)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            총 {filteredContent.length}개의 결과 중 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredContent.length)}번째 결과
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-lg border border-gray-200 ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: Math.min(5, Math.ceil(filteredContent.length / pageSize)) }, (_, i) => (
              <button
                key={i + 1}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className={`px-4 py-2 rounded-lg border border-gray-200 ${
                currentPage === Math.ceil(filteredContent.length / pageSize)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredContent.length / pageSize), prev + 1))}
              disabled={currentPage === Math.ceil(filteredContent.length / pageSize)}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 