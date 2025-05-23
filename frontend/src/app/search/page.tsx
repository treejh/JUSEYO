"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// 타입 정의
interface SearchItem {
  id: number;
  name: string;
  category: string;
  image: string | null;
  status: string;
}

// 추천 검색어 데이터
const RECOMMENDED_SEARCHES = [
  "맥북",
  "모니터 스탠드",
  "무선 마우스",
  "USB 허브",
  "화이트보드 마커"
];

// 테스트 데이터
const TEST_ITEMS: SearchItem[] = [
  {
    id: 1,
    name: "맥북 프로 16인치 M2",
    category: "전자기기",
    image: "/images/macbook-pro-16.jpg",
    status: "대여가능"
  },
  {
    id: 2,
    name: "맥북 에어 13인치 M2",
    category: "전자기기",
    image: "/images/macbook-air-13.jpg",
    status: "대여가능"
  },
  {
    id: 3,
    name: "맥북 프로 14인치 M1",
    category: "전자기기",
    image: "/images/macbook-pro-14.jpg",
    status: "대여가능"
  },
  {
    id: 4,
    name: "모니터 32인치 4K",
    category: "전자기기",
    image: "/images/monitor-32.jpg",
    status: "대여가능"
  },
  {
    id: 5,
    name: "무선 마우스",
    category: "전자기기",
    image: "/images/wireless-mouse.jpg",
    status: "대여가능"
  },
  {
    id: 6,
    name: "USB-C 허브 맥북용",
    category: "전자기기",
    image: "/images/usb-hub.jpg",
    status: "대여가능"
  },
  {
    id: 7,
    name: "화이트보드 마커",
    category: "사무용품",
    image: "/images/marker.jpg",
    status: "대여가능"
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const ITEMS_PER_PAGE = 10;
  
  // 검색 실행
  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) return;
    
    // URL 업데이트
    const url = new URL(window.location.href);
    url.searchParams.set("q", searchText.trim());
    url.searchParams.set("page", "1"); // 새 검색시 첫 페이지로
    window.history.pushState({}, "", url);

    // 검색 결과 필터링
    const filtered = TEST_ITEMS.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    setResults(filtered);
    setIsSearched(true);
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    window.history.pushState({}, "", url);
    
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo(0, 0);
  };

  // 현재 페이지의 아이템들
  const currentItems = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 총 페이지 수
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

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
          /* 추천 검색어 */
          <div className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-3">추천 검색어</h2>
            <div className="flex flex-wrap gap-2">
              {RECOMMENDED_SEARCHES.map((text, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(text);
                    handleSearch(text);
                  }}
                  className="px-4 py-1.5 text-sm bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                >
                  {text}
                </button>
              ))}
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

            {results.length > 0 ? (
              <>
                <div className="space-y-3">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg p-4 flex items-center gap-4"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                          <span className="text-gray-400 text-xs">이미지 없음</span>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/items/${item.id}`)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                        >
                          조회
                        </button>
                        <button
                          onClick={() => router.push(`/items/${item.id}/request`)}
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