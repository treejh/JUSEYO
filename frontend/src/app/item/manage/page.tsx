"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
      alert(err.message);
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
      alert(err.message);
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
      alert("삭제 중 오류가 발생했습니다.");
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
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 검색 + 버튼 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="상품명/SKU 검색"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              {/* 돌아가기 버튼 제거 */}
              <button
                onClick={handleExcelDownload}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                비품 생성
              </Link>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-gray-500 text-xs">No</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">상품명</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">카테고리</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">가격/조회</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">위치</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">상태</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">재고</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">등록일</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">수정일</th>
                  <th className="px-4 py-3 text-gray-500 text-xs">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">{i + 1}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-400">No IMG</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">ID: {item.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.categoryName}</td>
                    <td className="px-4 py-3">{item.purchaseSource ?? "-"}</td>
                    <td className="px-4 py-3">{item.location ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        정상
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.availableQuantity}/{item.totalQuantity}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.modifiedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={(e) => toggleMenu(e, item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                      >
                        ⋮
                      </button>
                      {openMenuId === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-0 mt-8 w-32 bg-white rounded-lg shadow-lg z-20 border transform -translate-y-1/2">
                            <Link
                              href={`/item/manage/edit/${item.id}`}
                              className="block px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              수정
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                            >
                              삭제
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
