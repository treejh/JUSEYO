// src/app/search/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";

// 타입 정의
interface SearchItem {
  id: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  availableQuantity: number;
  status: string;
  image?: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [itemImages, setItemImages] = useState<Record<number, string>>({});
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [randomItems, setRandomItems] = useState<SearchItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const ITEMS_PER_PAGE = 10;
  const SUGGESTION_COUNT = 5;
  
  // 추천 검색어만 새로고침하는 함수
  const refreshSuggestions = useCallback(() => {
    setRandomItems(getRandomItems(allItems, SUGGESTION_COUNT));
  }, [allItems]);

  // 검색 상태 초기화 함수
  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setResults([]);
    setIsSearched(false);
    setTotalPages(0);
    refreshSuggestions();
  }, [refreshSuggestions]);

  // 페이지 진입 시 초기화
  useEffect(() => {
    resetSearch();
  }, [resetSearch]);

  // pathname이 변경될 때마다 초기화
  useEffect(() => {
    if (pathname === '/search') {
      resetSearch();
      setRefreshKey(prev => prev + 1);
    }
  }, [pathname, resetSearch]);

  // 추천 검색어 새로고침 효과
  useEffect(() => {
    refreshSuggestions();
  }, [refreshKey, refreshSuggestions]);

  // URL 쿼리 파라미터 변경 감지
  useEffect(() => {
    const currentQuery = searchParams.get("q");
    // 쿼리 파라미터가 없어지면 초기화
    if (!currentQuery) {
      resetSearch();
    }
  }, [searchParams, resetSearch]);

  // 랜덤으로 아이템을 선택하는 함수
  const getRandomItems = (items: SearchItem[], count: number) => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 모든 아이템의 이미지 정보를 가져오는 함수
  const fetchItemImages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/all`, {
        credentials: "include",
      });
      if (!res.ok) return;
      
      const items: SearchItem[] = await res.json();
      const imageMap: Record<number, string> = {};
      
      items.forEach(item => {
        if (item.image) {
          imageMap[item.id] = item.image;
        }
      });
      
      setItemImages(imageMap);
    } catch (error) {
      console.error("이미지 정보 가져오기 실패:", error);
    }
  };
  
  // 모든 아이템 정보를 가져오는 함수
  const fetchAllItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/all`, {
        credentials: "include",
      });
      if (!res.ok) return;
      
      const items: SearchItem[] = await res.json();
      // 활성화된 아이템만 필터링
      const activeItems = items.filter(item => item.status === "ACTIVE");
      setAllItems(activeItems);
      
      // 이미지 맵 업데이트
      const imageMap: Record<number, string> = {};
      items.forEach(item => {
        if (item.image) {
          imageMap[item.id] = item.image;
        }
      });
      setItemImages(imageMap);
    } catch (error) {
      console.error("아이템 정보 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);
  
  // 검색 실행
  const handleSearch = async (searchText: string, page: number = 0) => {
    if (!searchText.trim()) {
      resetSearch();
      return;
    }
    
    setLoading(true);
    try {
      // URL 업데이트
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}&page=${page + 1}`);

      // 검색 API 호출
      const response = await fetch(
        `${API_BASE}/api/v1/search/items?managementDashboardId=1&keyword=${encodeURIComponent(searchText)}&page=${page}&size=${ITEMS_PER_PAGE}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("검색 중 오류가 발생했습니다.");
      }

      const data: ApiResponse<SearchItem> = await response.json();
      
      // 검색 결과가 있으면 이미지 정보도 가져옴
      if (data.data.content.length > 0) {
        await fetchItemImages();
      }
      
      // 검색 결과에 이미지 정보 추가
      const resultsWithImages = data.data.content.map(item => ({
        ...item,
        image: itemImages[item.id]
      }));

      setResults(resultsWithImages);
      setTotalPages(data.data.totalPages);
      setIsSearched(true);
    } catch (error) {
      console.error("검색 오류:", error);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(searchQuery, page - 1);
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (query) {
      handleSearch(query, currentPage - 1);
    }
  }, [query]);

  // 검색 메뉴 클릭 핸들러
  const handleSearchMenuClick = useCallback(() => {
    if (pathname === '/search' && !searchParams.get('q')) {
      // 이미 검색 페이지이고 검색어가 없는 상태면 강제 새로고침
      resetSearch();
      setRefreshKey(prev => prev + 1);
    } else {
      // 다른 페이지에서 오거나 검색 결과가 있는 상태면 라우터 사용
      router.push('/search');
    }
  }, [pathname, searchParams, router, resetSearch]);

  // window 객체에 핸들러 등록
  useEffect(() => {
    // 전역 객체에 함수 노출
    (window as any).handleSearchMenuClick = handleSearchMenuClick;
    
    return () => {
      delete (window as any).handleSearchMenuClick;
    };
  }, [handleSearchMenuClick]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 pl-8">
      <div className="max-w-7xl mx-auto px-8">
        {/* 타이틀 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          어떤 비품이<br />
          필요하신가요?
        </h1>
        
        {/* 검색 입력창 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(searchQuery);
              }}
              placeholder="비품을 검색해 주세요"
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white"
            />
            <svg
              className="absolute left-4 top-3.5 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {!isSearched && (
          <div className="mt-12 mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-3">추천 검색어</h2>
            <div className="flex flex-wrap gap-2">
              {randomItems.length > 0 ? (
                randomItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.name);
                      handleSearch(item.name);
                    }}
                    className="px-4 py-1.5 text-sm bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm">등록된 비품이 아직 없습니다.</p>
              )}
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        {isSearched && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                &quot;{query}&quot;의 검색 결과
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                총 {results.length}개의 비품이 검색되었습니다.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 rounded-full border-t-transparent" />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="space-y-3">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-xs">No IMG</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{item.categoryName}</p>
                        <div className="mt-1 text-sm">
                          <span className="text-gray-400">
                            남은 수량 {item.availableQuantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/item/supplyrequest/create/${item.id}`)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
                        >
                          요청
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 