'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FC, useState } from 'react';
import { HiArchiveBox } from 'react-icons/hi2';

interface CategoryItem {
  id: number;
  name: string;
  count: number;
  status: '삭제' | '사용';
}

const ITEMS_PER_PAGE = 10;

const CategoryManagementPage: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // 실제로는 API에서 받아올 데이터
  const categories: CategoryItem[] = [
    { id: 1, name: '전자기기', count: 5, status: '사용' },
    { id: 2, name: '종이', count: 5, status: '사용' },
    { id: 3, name: '소프트웨어', count: 3, status: '사용' },
    { id: 4, name: '하드웨어', count: 7, status: '삭제' },
    { id: 5, name: '사무용품', count: 12, status: '사용' },
    { id: 6, name: '가구', count: 4, status: '사용' },
    { id: 7, name: '도서', count: 8, status: '사용' },
    { id: 8, name: '음향기기', count: 6, status: '삭제' },
    { id: 9, name: '네트워크장비', count: 9, status: '사용' },
    { id: 10, name: '소모품', count: 15, status: '사용' },
    { id: 11, name: '기타', count: 3, status: '사용' },
  ];

  // 페이지네이션 계산
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = categories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = (id: number) => {
    // TODO: 삭제 로직 구현
    console.log('삭제:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 전체 레이아웃 컨테이너 */}
      <div className="flex min-h-screen">
        {/* 사이드바 영역 (실제 구현 시 컴포넌트로 대체) */}
        <div className="w-64 bg-white border-r border-gray-200">
          {/* 사이드바 내용은 별도 컴포넌트로 구현 예정 */}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
          </div>

          {/* 카테고리 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full border border-[#EEEEEE] rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b border-[#EEEEEE]">
                  <th className="text-left px-6 py-4 text-gray-900 font-bold text-base">카테고리</th>
                  <th className="text-center px-6 py-4 text-gray-900 font-bold text-base">품목 수</th>
                  <th className="w-24 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category, index) => (
                  <tr 
                    key={category.id} 
                    className={`border-b border-[#EEEEEE] hover:bg-[#0047AB]/5 transition-colors cursor-pointer
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="text-left px-6 py-4">
                      <Link 
                        href={`/settings/categories/edit/${category.id}`}
                        className="hover:text-[#0047AB] hover:font-semibold transition-all flex items-center gap-4"
                      >
                        <HiArchiveBox className="text-gray-400 text-lg" />
                        {category.name}
                      </Link>
                    </td>
                    <td className="text-center px-6 py-4">{category.count}</td>
                    <td className="text-center px-6 py-4">
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8">
              <Link href="/settings/categories/add">
                <Button className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors">
                  + 추가하기
                </Button>
              </Link>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-gray-200 text-gray-700'
                        : 'border border-[#EEEEEE] hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage; 