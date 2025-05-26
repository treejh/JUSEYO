"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  category: string;
  image: string | null;
  status: "전자기기" | "사무용품" | "필기구" | "소모품";
}

const CATEGORIES = [
  { id: "전체", name: "전체" },
  { id: "전자기기", name: "전자기기" },
  { id: "사무용품", name: "사무용품" },
  { id: "필기구", name: "필기구" },
  { id: "소모품", name: "소모품" },
];

const ITEMS_PER_PAGE = 15;

// 테스트용 아이템 데이터 (실제로는 API에서 받아올 예정)
const TEST_ITEMS: Item[] = [
  {
    id: 1,
    name: "맥북 프로 16인치",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 2,
    name: "모니터 32인치",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 3,
    name: "제트스트림 0.5mm",
    category: "필기구",
    image: null,
    status: "필기구"
  },
  {
    id: 4,
    name: "노트 패드 - A5",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 5,
    name: "매직 키보드",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 6,
    name: "매직 마우스",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 7,
    name: "사무용 의자",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 8,
    name: "전동 높이조절 책상",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 9,
    name: "모니터 받침대",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 10,
    name: "프린터",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 11,
    name: "A4용지 (1박스)",
    category: "소모품",
    image: null,
    status: "소모품"
  },
  {
    id: 12,
    name: "볼펜 세트",
    category: "필기구",
    image: null,
    status: "필기구"
  },
  {
    id: 13,
    name: "포스트잇",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 14,
    name: "화이트보드",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 15,
    name: "Adobe Creative Cloud",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 16,
    name: "무선 마이크",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 17,
    name: "웹캠",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 18,
    name: "멀티탭",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 19,
    name: "클립보드",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 20,
    name: "스테이플러",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 21,
    name: "펀치",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 22,
    name: "형광펜 세트",
    category: "필기구",
    image: null,
    status: "필기구"
  },
  {
    id: 23,
    name: "마커 세트",
    category: "필기구",
    image: null,
    status: "필기구"
  },
  {
    id: 24,
    name: "복사용지 A3",
    category: "소모품",
    image: null,
    status: "소모품"
  },
  {
    id: 25,
    name: "프린터 토너",
    category: "소모품",
    image: null,
    status: "소모품"
  },
  {
    id: 26,
    name: "문서 파쇄기",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 27,
    name: "스캐너",
    category: "전자기기",
    image: null,
    status: "전자기기"
  },
  {
    id: 28,
    name: "화이트보드 마커",
    category: "필기구",
    image: null,
    status: "필기구"
  },
  {
    id: 29,
    name: "클립",
    category: "사무용품",
    image: null,
    status: "사무용품"
  },
  {
    id: 30,
    name: "USB 허브",
    category: "전자기기",
    image: null,
    status: "전자기기"
  }
];

export default function ItemViewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [items, setItems] = useState<Item[]>(TEST_ITEMS);
  const [filteredItems, setFilteredItems] = useState<Item[]>(TEST_ITEMS);
  const [currentPage, setCurrentPage] = useState(1);

  // 검색어와 카테고리에 따라 아이템 필터링
  useEffect(() => {
    let filtered = [...items];
    
    // 카테고리 필터링
    if (selectedCategory !== "전체") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // 검색어 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
    setCurrentPage(1); // 필터링할 때마다 첫 페이지로 이동
  }, [searchQuery, selectedCategory, items]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 요청 버튼 클릭 핸들러
  const handleRequest = (item: Item) => {
    // TODO: 요청 처리 로직 구현
    console.log("요청된 아이템:", item);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">비품 조회</h1>
        
        {/* 검색 바 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="비품을 검색해 주세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-4 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 아이템 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col"
            >
              <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-md">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-md"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    이미지 없음
                  </div>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{item.category}</p>
              <button
                onClick={() => handleRequest(item)}
                className="mt-auto self-start px-4 py-1.5 text-sm bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
              >
                요청
              </button>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md bg-white text-gray-600 disabled:opacity-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md bg-white text-gray-600 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 