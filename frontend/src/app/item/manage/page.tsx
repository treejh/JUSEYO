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
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const toast = useCustomToast();
  const router = useRouter();

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
      setFilteredItems(active);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredItems(
      items.filter((item) => item.name.toLowerCase().includes(term))
    );
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            비품 관리
          </h1>
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
          <div className="flex items-center justify-between">
            <p className="text-gray-600">비품 정보를 관리할 수 있습니다.</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExcelDownload}
                className="inline-flex items-center px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
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
              <Link
                href="/item/manage/create"
                className="inline-flex items-center px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
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
              </Link>
            </div>
          </div>
        </div>

        {/* 검색 */}
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
              placeholder="비품 이름으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">비품 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[25%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[15%]" />
                  <col className="w-[20%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      No
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      비품 정보
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      카테고리
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      위치
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      재고
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      등록/수정일
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item, i) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
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
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={(e) => toggleMenu(e, item.id)}
                            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                          {openMenuId === item.id && (
                            <div
                              className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 divide-y divide-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <Link
                                  href={`/item/manage/edit/${item.id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <svg
                                    className="mr-3 h-4 w-4 text-gray-500"
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
                              </div>
                              <div className="py-1">
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <svg
                                    className="mr-3 h-4 w-4 text-red-500"
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
                            </div>
                          )}
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
