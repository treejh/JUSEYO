'use client';

import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import categoryService from '@/services/categoryService';
import { toast } from 'sonner';

const CategoryEditPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [params.id]);

  const fetchCategory = async () => {
    try {
      setIsLoading(true);
      const category = await categoryService.getCategoryById(Number(params.id));
      setCategoryName(category.name);
      setError(null);
    } catch (err) {
      setError('카테고리를 불러오는데 실패했습니다.');
      console.error('Error fetching category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await categoryService.updateCategory(Number(params.id), { name: categoryName.trim() });
      toast.success('카테고리가 수정되었습니다.');
      router.push('/settings/categories');
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('카테고리 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
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
                disabled={isSubmitting}
              />
            </div>

            <div className="flex space-x-4 mt-12">
              <Button
                type="submit"
                className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '수정하기'}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/settings/categories')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-base hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
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