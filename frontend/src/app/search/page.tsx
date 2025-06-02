// src/app/search/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [loading, setLoading] = useState(true);
  const [itemImages, setItemImages] = useState<Record<number, string>>({});
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [randomItems, setRandomItems] = useState<SearchItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const checkStabilityTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const randomValuesStableCount = useRef<number>(0);
  const lastRandomItems = useRef<SearchItem[]>([]);
  const skeletonWidths = useRef<number[]>([]);
  const hasInitialized = useRef<boolean>(false);

  const ITEMS_PER_PAGE = 10;
  const SUGGESTION_COUNT = 5;
  const RECENT_ITEMS_COUNT = 10;
  const STABLE_CHECK_INTERVAL = 100;
  const REQUIRED_STABLE_COUNT = 5;
  const MIN_SKELETON_WIDTH = 80;
  const MAX_SKELETON_WIDTH = 120;
  
  // 랜덤으로 아이템을 선택하는 함수
  const getRandomItems = useCallback((items: SearchItem[], count: number) => {
    if (!items.length) return [];
    // 아이템 수가 원하는 개수보다 적으면 모든 아이템을 표시하되, 스켈레톤은 실제 아이템 수만큼만 표시
    if (items.length <= count) return items;
    // 그렇지 않으면 랜덤으로 선택
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, []);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (checkStabilityTimeout.current) {
        clearTimeout(checkStabilityTimeout.current);
        checkStabilityTimeout.current = null;
      }
    };
  }, []);

  // 스켈레톤 너비 초기화
  useEffect(() => {
    // 초기 스켈레톤 너비 설정
    skeletonWidths.current = Array(SUGGESTION_COUNT).fill(0).map(() => 
      Math.floor(Math.random() * (MAX_SKELETON_WIDTH - MIN_SKELETON_WIDTH) + MIN_SKELETON_WIDTH)
    );
  }, []);

  // 랜덤 값이 안정화되었는지 확인하는 함수
  const checkRandomValuesStable = useCallback((currentItems: SearchItem[]) => {
    const currentItemIds = currentItems.map(item => item.id).join(',');
    const lastItemIds = lastRandomItems.current.map(item => item.id).join(',');

    if (currentItemIds === lastItemIds) {
      randomValuesStableCount.current += 1;
      if (randomValuesStableCount.current >= REQUIRED_STABLE_COUNT) {
        setShowSuggestions(true);
        return true;
      }
    } else {
      randomValuesStableCount.current = 0;
      lastRandomItems.current = currentItems;
    }
    return false;
  }, []);

  // 추천 검색어 준비 함수
  const prepareSuggestions = useCallback(async () => {
    // 이미 초기화되었거나 로딩 중이면 실행하지 않음
    if (hasInitialized.current || loading) {
      return;
    }
    
    // 즉시 초기화 상태로 설정하여 중복 호출 방지
    hasInitialized.current = true;

    try {
      setLoading(true);
      setRandomItems([]);

      const response = await fetch(`${API_BASE}/api/v1/items/all`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("아이템을 가져오는데 실패했습니다.");
      }

      const items: SearchItem[] = await response.json();

      if (!Array.isArray(items)) {
        console.error("Received data is not an array:", items);
        return;
      }

      const uniqueItems = items
        .filter((item) => item && item.name)
        .reduce((acc: SearchItem[], current: SearchItem) => {
          if (!acc.some((item) => item.name === current.name)) {
            acc.push(current);
          }
          return acc;
        }, []);

      const shuffled = [...uniqueItems].sort(() => 0.5 - Math.random());
      const selectedItems = shuffled.slice(0, Math.min(SUGGESTION_COUNT, uniqueItems.length));

      setRandomItems(selectedItems);

    } catch (error) {
      console.error("추천 검색어 로드 실패:", error);
      // 에러 발생 시 초기화 상태 리셋
      hasInitialized.current = false;
    } finally {
      setLoading(false);
    }
  }, [loading]); // loading 상태를 의존성 배열에 추가

  // 모든 아이템의 이미지 정보를 가져오는 함수
  const fetchItemImages = useCallback(async () => {
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
  }, []);

  // 이미지 로딩 완료 핸들러
  const handleImageLoad = (imageSrc: string) => {
    setLoadedImages(prev => new Set([...prev, imageSrc]));
  };

  // 검색 상태 초기화 함수
  const resetSearchState = useCallback(() => {
    setSearchQuery("");
    setResults([]);
    setIsSearched(false);
    setTotalPages(0);
    setLoading(false);
    setIsLoadingSuggestions(true);
    setIsStable(false);
    setRandomItems([]);
  }, []);

  // 초기화 및 데이터 로딩을 한 번에 처리하는 함수
  const initializeSearchPage = useCallback(async () => {
    // 상태 초기화 전에 이전 타임아웃 클리어
    if (checkStabilityTimeout.current) {
      clearTimeout(checkStabilityTimeout.current);
    }
    
    // 상태 초기화
    resetSearchState();
    setRandomItems([]); // 기존 아이템 클리어

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/items/all`,
        {
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("아이템을 가져오는데 실패했습니다.");
      }

      const items: SearchItem[] = await response.json();
      
      if (!Array.isArray(items)) {
        console.error('Received data is not an array:', items);
        return;
      }

      // 유효성 검사 및 중복 제거
      const uniqueItems = items.filter(item => {
        if (!item || !item.name) return false;
        return true;
      }).reduce((acc: SearchItem[], current: SearchItem) => {
        const isDuplicate = acc.some(item => item.name === current.name);
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      // 랜덤으로 아이템 선택 (최대 5개)
      const shuffled = [...uniqueItems].sort(() => 0.5 - Math.random());
      const selectedItems = shuffled.slice(0, Math.min(SUGGESTION_COUNT, uniqueItems.length));
      
      setRandomItems(selectedItems);
      setIsLoadingSuggestions(false);
      setIsStable(true);
    } catch (error) {
      console.error("아이템 로드 실패:", error);
      setIsLoadingSuggestions(false);
      setIsStable(true);
    }
  }, [resetSearchState]);

  // pathname이 변경될 때마다 초기화
  useEffect(() => {
    if (pathname === '/search') {
      const searchParam = searchParams.get('q');
      if (!searchParam) {
        initializeSearchPage();
      }
    }
  }, [pathname, searchParams, initializeSearchPage]);

  // popstate 이벤트 리스너 추가 (뒤로가기/앞으로가기 감지)
  useEffect(() => {
    const handlePopState = () => {
      if (pathname === '/search' && !searchParams.get('q')) {
        initializeSearchPage();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pathname, searchParams, initializeSearchPage]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!isSearched) {
        initializeSearchPage();
      }
    }
  }, [isSearched, initializeSearchPage]);

  // 검색 실행
  const handleSearch = async (searchText: string, page: number = 0) => {
    if (!searchText.trim()) {
      hasInitialized.current = false;
      setLoading(true);
      initializeSearchPage();
      return;
    }

    setLoading(true);
    setIsSearched(true); // 먼저 검색 상태로 변경
    setIsLoadingSuggestions(false);
    setIsStable(false);

    try {
      // URL 업데이트
      router.push(`/search?q=${encodeURIComponent(searchText.trim())}&page=${page + 1}`);

      // 검색 API 호출
      const [searchResponse, imagesResponse] = await Promise.all([
        fetch(
          `${API_BASE}/api/v1/search/items?managementDashboardId=1&keyword=${encodeURIComponent(searchText)}&page=${page}&size=${ITEMS_PER_PAGE}`,
          {
            credentials: "include",
          }
        ),
        fetch(`${API_BASE}/api/v1/items/all`, {
          credentials: "include",
        })
      ]);

      if (!searchResponse.ok || !imagesResponse.ok) {
        throw new Error("검색 중 오류가 발생했습니다.");
      }

      const [searchData, imagesData]: [ApiResponse<SearchItem>, SearchItem[]] = await Promise.all([
        searchResponse.json(),
        imagesResponse.json()
      ]);
      
      // 이미지 맵 업데이트
      const imageMap: Record<number, string> = {};
      imagesData.forEach(item => {
        if (item.image) {
          imageMap[item.id] = item.image;
        }
      });
      setItemImages(imageMap);
      
      // 검색 결과에 이미지 정보 추가
      const resultsWithImages = searchData.data.content.map(item => ({
        ...item,
        image: imageMap[item.id]
      }));

      setResults(resultsWithImages);
      setTotalPages(searchData.data.totalPages);
    } catch (error) {
      console.error("검색 오류:", error);
      alert("검색 중 오류가 발생했습니다.");
      setResults([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    const currentQuery = searchParams.get('q');
    if (currentQuery) {
      handleSearch(currentQuery, page - 1);
    }
    window.scrollTo(0, 0);
  };

  // 검색어가 있을 때만 검색 실행
  useEffect(() => {
    if (query && pathname === '/search') {
      handleSearch(query, currentPage - 1);
    }
  }, [query, pathname]);

  // 컴포넌트 마운트/검색 상태 변경 시 추천 검색어 준비
  useEffect(() => {
    if (!isSearched) {
      prepareSuggestions();
    }
  }, [isSearched, prepareSuggestions]);

  // isVisible 상태 관리
  useEffect(() => {
    if (!isLoadingSuggestions && randomItems.length > 0) {
      setIsVisible(true);
    }
  }, [isLoadingSuggestions, randomItems]);

  // 검색 결과 스켈레톤 컴포넌트
  const SearchResultSkeleton = () => (
    <div className="bg-white rounded-lg p-4 flex items-center gap-4">
      <div className="flex-grow flex items-center gap-4 p-2 rounded-lg">
        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 animate-pulse rounded-md" />
        <div className="flex-grow min-w-0">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );

  // 검색 결과가 아닐 때만 추천 검색어 표시
  const shouldShowSuggestions = !isSearched && isStable && randomItems.length > 0;

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
                if (e.key === "Enter") {
                  setLoading(true);
                  handleSearch(searchQuery);
                }
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

        {/* 추천 검색어 섹션 */}
        {!isSearched && (
          <div className="mt-12 mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-3">추천 검색어</h2>
            <div className="flex flex-wrap gap-3">
              {loading ? (
                // 스켈레톤 로딩 UI
                <div className="flex flex-wrap gap-3">
                  {[...Array(SUGGESTION_COUNT)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="animate-pulse bg-gray-200 rounded-full h-8"
                      style={{ width: `${skeletonWidths.current[index] || MIN_SKELETON_WIDTH}px` }}
                    />
                  ))}
                </div>
              ) : randomItems.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {randomItems.map((item) => (
                    <button
                      key={`suggestion-${item.id}`}
                      onClick={() => {
                        setSearchQuery(item.name);
                        handleSearch(item.name);
                      }}
                      className="px-4 py-1.5 text-sm bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
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
                {loading ? "검색 중..." : `총 ${results.length}개의 비품이 검색되었습니다.`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <SearchResultSkeleton key={index} />
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="space-y-3">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 flex items-center gap-4"
                    >
                      <div
                        className="flex-grow flex items-center gap-4 cursor-pointer p-2 rounded-lg"
                        onClick={() => router.push(`/item/detail/${item.id}`)}
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                          {item.image ? (
                            <>
                              {!loadedImages.has(item.image) && (
                                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                              )}
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className={`object-cover w-full h-full transition-opacity duration-200 ${
                                  loadedImages.has(item.image) ? 'opacity-100' : 'opacity-0'
                                }`}
                                style={{ objectFit: 'cover' }}
                                onLoad={() => handleImageLoad(item.image!)}
                              />
                            </>
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
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/item/detail/${item.id}`)}
                          className="px-4 py-1.5 text-sm bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          조회
                        </button>
                        <button
                          onClick={() => router.push(`/item/supplyrequest/create/${item.id}`)}
                          className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
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