"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
      alert("비품 로드 실패: " + err.message);
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
      console.error("카테고리 로드 실패", err);
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
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">비품 조회</h1>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="비품을 검색해 주세요"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full px-4 py-3 border border-[#2563eb] rounded-sm focus:outline-none focus:border-[#2563eb]"
          />
          <button
            onClick={() => setPage(0)}
            className="absolute right-0 top-0 h-full px-6 bg-[#2563eb] text-white hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
        </div>

        <div className="flex gap-6 mb-8 border-b">
          <button
            onClick={() => {
              setSelectedCategory("전체");
              setPage(0);
            }}
            className={`px-2 py-3 font-medium ${
              selectedCategory === "전체"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-gray-600 hover:text-[#2563eb]"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setPage(0);
              }}
              className={`px-2 py-3 font-medium ${
                selectedCategory === cat.name
                  ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                  : "text-gray-600 hover:text-[#2563eb]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#2563eb] rounded-full border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div
                  onClick={() => router.push(`/item/detail/${item.id}`)}
                  className="aspect-square bg-gray-100 rounded-sm mb-3 overflow-hidden cursor-pointer"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      이미지 없음
                    </div>
                  )}
                </div>
                <h3 className="font-medium mb-1 group-hover:text-[#03c75a]">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">{item.categoryName}</p>
                <div className="mt-2 text-sm">
                  <span className="text-[#03c75a] font-medium">
                    {item.availableQuantity}
                  </span>
                  /{item.totalQuantity}
                </div>
                {/* 경로를 /item/manage/create/[id] 로 변경 */}
                <button
                  onClick={() =>
                    router.push(`/item/supplyrequest/create/${item.id}`)
                  }
                  className="mt-2 w-full px-3 py-2 text-sm border border-[#2563eb] text-[#2563eb] rounded-sm hover:bg-[#2563eb] hover:text-white transition-colors"
                >
                  요청
                </button>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center border rounded-sm disabled:opacity-50 hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 flex items-center justify-center border rounded-sm ${
                  page === i
                    ? "bg-[#2563eb] text-white"
                    : "hover:border-[#2563eb] hover:text-[#2563eb]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-8 h-8 flex items-center justify-center border rounded-sm disabled:opacity-50 hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
