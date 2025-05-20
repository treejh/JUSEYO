'use client';

import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

const CategoryEditPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 임시 데이터 (API 구현 전까지 사용)
    const categories = [
      { id: 1, name: '전자기기' },
      { id: 2, name: '중이' },
      { id: 3, name: '소프트웨어' },
      { id: 4, name: '하드웨어' },
      { id: 5, name: '사무용품' },
      { id: 6, name: '가구' },
      { id: 7, name: '도서' },
      { id: 8, name: '음향기기' },
      { id: 9, name: '네트워크장비' },
      { id: 10, name: '소모품' },
      { id: 11, name: '기타' },
    ];

    const category = categories.find(cat => cat.id === Number(params.id));
    if (category) {
      setCategoryName(category.name);
    } else {
      setError('카테고리를 찾을 수 없습니다.');
    }
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 구현 후 실제 수정 로직 추가
    console.log('수정된 카테고리:', categoryName);
    router.push('/settings/categories');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <div className="w-64 bg-white border-r border-gray-200">
            {/* 사이드바 내용은 별도 컴포넌트로 구현 예정 */}
          </div>

          <div className="flex-1 p-12 pt-16 pl-16 bg-white">
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-gray-900">오류</h1>
            </div>
            <p className="text-red-500">{error}</p>
            <Button
              onClick={() => router.push('/settings/categories')}
              className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded text-base hover:bg-gray-200 transition-colors"
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="w-64 bg-white border-r border-gray-200">
          {/* 사이드바 내용은 별도 컴포넌트로 구현 예정 */}
        </div>

        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">카테고리 수정</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="mb-6">
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리명
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                placeholder="카테고리명을 입력하세요"
                required
              />
            </div>

            <div className="flex space-x-4 mt-12">
              <Button
                type="submit"
                className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors"
              >
                수정하기
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/settings/categories')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-base hover:bg-gray-200 transition-colors"
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditPage; 