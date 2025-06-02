"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCustomToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  availableQuantity: number;
  purchaseSource?: string;
  location?: string;
  serialNumber?: string;
  status: string;
  image?: string;
  createdAt: string;
  modifiedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function AllItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const toast = useCustomToast();
  const router = useRouter();

  // (1) 전체 아이템 로드
  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/all`, {
        credentials: "include",
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`서버 오류: ${msg}`);
      }
      const data: Item[] = await res.json();
      const active = data.filter((item) => item.status === "ACTIVE");
      setItems(active);

      // 유일한 카테고리 목록
      const cats = Array.from(new Set(active.map((it) => it.categoryName)));
      setCategories(cats);

      // 초기 필터링
      setFilteredItems(active);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // (2) 검색어/카테고리 변경 시 필터 적용
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredItems(
      items.filter((item) => {
        const matchesName = item.name.toLowerCase().includes(term);
        const matchesCat =
          selectedCategory === "" || item.categoryName === selectedCategory;
        return matchesName && matchesCat;
      })
    );
  }, [items, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchAllItems();
  }, []);

  // 드롭다운 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.add-menu-container')) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleExcelDownload = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/export/items`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("엑셀 파일 생성에 실패했습니다.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "items.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 항목을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("삭제 실패");
      await fetchAllItems();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setOpenMenuId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">비품 관리</h1>
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            <Link
              href="/item/manage"
              className="px-4 py-3 font-medium text-[#0047AB] border-b-2 border-[#0047AB]"
            >
              비품 정보
            </Link>
            <Link
              href="/item/iteminstance/manage"
              className="px-4 py-3 font-medium text-gray-600 hover:text-[#0047AB] border-b-2 border-transparent hover:border-[#0047AB] transition-all"
            >
              재고 단위
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">비품 정보를 관리할 수 있습니다.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExcelDownload}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-all"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                엑셀 다운로드
              </button>
              <div className="relative add-menu-container">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-medium bg-[#0047AB] text-white rounded-lg hover:bg-[#003d91] transition-all"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  비품 추가
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 py-1">
                    <Link
                      href="/item/manage/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      새로운 비품 추가
                    </Link>
                    <Link
                      href="/item/manage/purchase"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      기존 비품 추가
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 검색 + 필터 섹션 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 비품 검색 */}
            <div className="lg:col-span-9">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                비품 검색
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#0047AB]"
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
                  placeholder="비품 이름을 입력하세요"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-[#0047AB] transition-colors hover:border-[#0047AB]/50"
                />
              </div>
            </div>

            {/* 카테고리 드롭박스 */}
            <div className="lg:col-span-3">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                카테고리
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-[#0047AB] focus:border-[#0047AB] transition-colors hover:border-[#0047AB]/50"
                >
                  <option value="">전체 카테고리</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="py-2">
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-[#0047AB]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm">
            <div className="animate-spin h-12 w-12 border-b-2 border-[#0047AB] rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">비품 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[5%] sm:w-[5%]" />
                  <col className="w-[30%] sm:w-[25%]" />
                  <col className="w-[15%] sm:w-[12%]" />
                  <col className="w-[15%] sm:w-[13%]" />
                  <col className="w-[15%] sm:w-[15%]" />
                  <col className="hidden sm:table-cell sm:w-[20%]" />
                  <col className="w-[20%] sm:w-[10%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "No",
                      "비품 정보",
                      "카테고리",
                      "위치",
                      "재고",
                      "등록/수정일",
                      "관리",
                    ].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => router.push(`/item/detail/${item.id}`)}
                        >
                          <div className="flex-shrink-0 h-10 w-10">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg
                                  className="h-6 w-6 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.serialNumber || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 inline-flex text-sm font-medium rounded-md bg-[#E8F0FE] text-[#0047AB] border border-[#0047AB]/10">
                          {item.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          총 {item.totalQuantity}개
                        </div>
                        <div className="text-sm text-gray-500">
                          사용 가능 {item.availableQuantity}개
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          등록: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          수정: {new Date(item.modifiedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/item/manage/edit/${item.id}`}
                            className="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <svg
                              className="mr-1.5 h-4 w-4 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg
                              className="mr-1.5 h-4 w-4 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
