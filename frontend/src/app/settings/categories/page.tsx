// src/app/settings/categories/page.tsx

"use client";

import { useEffect, useState } from "react";
import categoryService, { CategoryResponseDTO } from "@/services/categoryService";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HiArchiveBox } from "react-icons/hi2";
import { toast } from "sonner";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

const CategoryListPage = () => {
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "카테고리 불러오기 실패");
      toast.error("카테고리 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말로 이 카테고리를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      toast.success("카테고리가 삭제되었습니다.");
      fetchCategories();
    } catch (err) {
      toast.error("카테고리 삭제에 실패했습니다.");
      console.error("Error deleting category:", err);
    }
  };

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = categories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full border border-[#EEEEEE] rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b border-[#EEEEEE]">
                  <th className="text-left px-6 py-4 text-gray-900 font-bold text-base">카테고리명</th>
                  <th className="text-center px-6 py-4 text-gray-900 font-bold text-base">품목 수</th>
                  <th className="w-24 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`border-b border-[#EEEEEE] hover:bg-[#0047AB]/5 transition-colors
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td
                      className="text-left px-6 py-4 cursor-pointer"
                      onClick={() => router.push(`/settings/categories/edit/${category.id}`)}
                    >
                      <div className="hover:text-[#0047AB] hover:font-semibold transition-all flex items-center gap-2">
                        <HiArchiveBox className="text-gray-400 text-lg" />
                        {category.name}
                      </div>
                    </td>
                    <td
                      className="text-center px-6 py-4 cursor-pointer"
                      onClick={() => router.push(`/settings/categories/edit/${category.id}`)}
                    >
                      {category.itemCount}
                    </td>
                    <td className="text-center px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id);
                        }}
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
                <button className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors">
                  + 추가하기
                </button>
              </Link>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-gray-200 text-gray-700"
                        : "border border-[#EEEEEE] hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
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

export default CategoryListPage;
