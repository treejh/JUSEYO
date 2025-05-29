"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCustomToast } from "@/utils/toast";

interface Item {
  id: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  availableQuantity: number;
  status: string;
  image?: string;
}

interface Category {
  id: number;
  name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function AllItemsPage() {
  const router = useRouter();
  const toast = useCustomToast();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const size = 15;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/all`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data: Item[] = await res.json();
      const active = data.filter((it) => it.status === "ACTIVE");
      setItems(active);
      setFilteredItems(active.slice(0, size));
    } catch (err: any) {
      toast.error("비품 로드 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/categories`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setCategories(await res.json());
    } catch (err) {
      toast.error("카테고리 로드 실패");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    let list = items;
    if (selectedCategory !== "전체") {
      list = list.filter((it) => it.categoryName === selectedCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((it) => it.name.toLowerCase().includes(term));
    }
    const start = page * size;
    setFilteredItems(list.slice(start, start + size));
  }, [items, selectedCategory, searchTerm, page]);

  const totalPages = Math.ceil(
    (selectedCategory === "전체"
      ? items.length
      : items.filter((it) => it.categoryName === selectedCategory).length) /
      size
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">비품 조회</h1>
        <p className="text-gray-600 mb-8">
          필요한 비품을 검색하고 요청할 수 있습니다.
        </p>

        {/* 검색 바 */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
              placeholder="비품 이름을 입력해주세요"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 카테고리 네비게이션 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setSelectedCategory("전체");
              setPage(0);
            }}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategory === "전체"
                ? "bg-[#0047AB] text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            전체
          </button>
          {categories.map((cat: Category) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat.name
                  ? "bg-[#0047AB] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 로딩 상태 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent mb-4" />
            <p className="text-gray-600">비품 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div
                  onClick={() => router.push(`/item/detail/${item.id}`)}
                  className="aspect-square relative overflow-hidden cursor-pointer"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                      <svg
                        className="w-12 h-12 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs font-medium text-blue-500 mb-1">
                    {item.categoryName}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-500 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      재고:{" "}
                      <span className="font-medium text-blue-500">
                        {item.availableQuantity}
                      </span>
                      <span className="text-gray-400">
                        /{item.totalQuantity}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      router.push(`/item/supplyrequest/create/${item.id}`)
                    }
                    disabled={item.availableQuantity === 0}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      item.availableQuantity > 0
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {item.availableQuantity > 0 ? "비품 요청하기" : "재고 없음"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`p-2 rounded-lg ${
                page === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="text-gray-600">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className={`p-2 rounded-lg ${
                page === totalPages - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
