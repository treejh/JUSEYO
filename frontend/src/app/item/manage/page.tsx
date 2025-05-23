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
  image?: string; // 이미지 URL
  createdAt: string;
  modifiedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function AllItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

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
      setItems(data.filter((item) => item.status === "ACTIVE"));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 이벤트 전파 중단
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 항목을 삭제하시겠습니까?")) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/items/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("삭제 실패");
        await fetchAllItems();
      } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
    setOpenMenuId(null);
  };

  React.useEffect(() => {
    fetchAllItems();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 상단 검색 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="상품명/SKU 검색"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
            <div className="flex items-center gap-4 ml-4">
              <Link
                href="/items"
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                돌아가기
              </Link>
              <Link
                href="/item/manage/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  className="w-5 h-5"
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
                <span>비품 생성</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      No
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      상품명
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      카테고리
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      가격/조회
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      위치
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      상태
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      재고
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      등록일
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      수정일
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-center">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
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
                              <span className="text-gray-400 text-xs">
                                No IMG
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {item.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.categoryName}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.purchaseSource ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.location ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          정상
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {item.availableQuantity}/{item.totalQuantity}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(item.modifiedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm relative">
                        <button
                          onClick={(e) => toggleMenu(e, item.id)}
                          className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                          <span>⋮</span>
                        </button>

                        {openMenuId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-0 mt-8 w-32 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200 transform -translate-y-1/2">
                              <div className="relative">
                                <Link
                                  href={`/item/manage/edit/${item.id}`}
                                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 whitespace-nowrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                  }}
                                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
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
                          </>
                        )}
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
