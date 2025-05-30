"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";

// API 반환 DTO
interface ItemInstance {
  id: number;
  itemName: string;
  instanceCode: string;
  outbound: string;
  status: string;
  borrowerName?: string;
  createdAt: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export default function ItemInstanceManagePage() {
  const router = useRouter();
  const { isLogin } = useGlobalLoginUser();

  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const loadInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        keyword: search.trim(),
      });
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/v1/item-instances?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Page<ItemInstance> = await res.json();

      const sorted = data.content.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInstances(sorted);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
      setError("자산 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, [page, search]);

  const handleSearch = () => {
    setPage(0);
    loadInstances();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">비품 관리</h1>
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            <Link
              href="/item/manage"
              className="px-4 py-3 font-medium text-gray-600 hover:text-[#0047AB] border-b-2 border-transparent hover:border-[#0047AB] transition-all"
            >
              비품 정보
            </Link>
            <Link
              href="/item/iteminstance/manage"
              className="px-4 py-3 font-medium text-[#0047AB] border-b-2 border-[#0047AB]"
            >
              재고 단위
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">비품의 개별 자산 현황을 확인할 수 있습니다.</p>
          </div>
        </div>

        {/* 검색 바 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative max-w-2xl">
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
            <input
              type="text"
              placeholder="코드 또는 품목명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">자산 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "ID",
                      "품목명",
                      "인스턴스 코드",
                      "출고 유형",
                      "상태",
                      "대여자",
                      "생성일",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((inst) => (
                    <tr
                      key={inst.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inst.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inst.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inst.instanceCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {inst.outbound}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          inst.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {inst.status === 'ACTIVE' ? '사용 가능' : '사용 불가'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inst.borrowerName || "–"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inst.createdAt).toLocaleString("ko-KR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    이전
                  </button>
                  <span className="text-gray-600">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
