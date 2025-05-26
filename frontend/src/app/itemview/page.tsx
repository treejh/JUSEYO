"use client";

import React, { useState, useEffect } from "react";
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
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 타이틀 */}
        <h1 className="text-2xl font-bold mb-8">비품 조회</h1>

        {/* 검색바 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="비품을 검색해 주세요"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 border border-[#2563eb] rounded-sm focus:outline-none focus:border-[#2563eb]"
            />
            <button
              onClick={() => handleSearch}
              className="absolute right-0 top-0 h-full px-6 bg-[#2563eb] text-white hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-6 mb-8 border-b">
          <button className="px-2 py-3 text-[#2563eb] border-b-2 border-[#2563eb] font-medium">
            전체
          </button>
          <button className="px-2 py-3 text-gray-600 hover:text-[#2563eb]">
            전자기기
          </button>
          <button className="px-2 py-3 text-gray-600 hover:text-[#2563eb]">
            사무용품
          </button>
          <button className="px-2 py-3 text-gray-600 hover:text-[#2563eb]">
            필기구
          </button>
          <button className="px-2 py-3 text-gray-600 hover:text-[#2563eb]">
            소모품
          </button>
        </div>

        {/* 비품 그리드 */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#2563eb] rounded-full border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-100 rounded-sm mb-3 overflow-hidden">
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
                <button className="mt-2 w-full px-3 py-2 text-sm border border-[#2563eb] text-[#2563eb] rounded-sm hover:bg-[#2563eb] hover:text-white transition-colors">
                  요청
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-12">
          <button className="w-8 h-8 flex items-center justify-center border rounded-sm hover:border-[#2563eb] hover:text-[#2563eb]">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center border rounded-sm bg-[#2563eb] text-white">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center border rounded-sm hover:border-[#2563eb] hover:text-[#2563eb]">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center border rounded-sm hover:border-[#2563eb] hover:text-[#2563eb]">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
