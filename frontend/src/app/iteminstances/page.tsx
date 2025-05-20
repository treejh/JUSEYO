"use client";

// app/iteminstances/page.tsx
// 개별 자산(ItemInstance) 목록 + 검색 + 페이징
// TailwindCSS + 기본 HTML 구성. API: GET /api/v1/item-instances

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ItemInstance {
  id: number;
  instanceCode: string;
  itemName: string;
  status: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const PAGE_SIZE = 20;

export default function ItemInstancePage() {
  const router = useRouter();
  const params = useSearchParams();

  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState<number>(Number(params.get("page")) || 0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/v1/item-instances", API_BASE);
      url.searchParams.set("page", String(page));
      url.searchParams.set("size", String(PAGE_SIZE));
      if (keyword.trim().length >= 2)
        url.searchParams.set("keyword", keyword.trim());

      console.log("GET", url.toString());
      const res = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const content: ItemInstance[] = Array.isArray(data)
        ? data
        : data.content ?? [];
      setInstances(content);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("조회 실패", err);
      alert("개별 자산 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(0);
    fetchInstances();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">개별 자산 목록</h1>

        {/* 검색 */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="자산 이름 또는 코드 검색 (2자 이상)"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            검색
          </button>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">코드</th>
                <th className="px-4 py-2">비품명</th>
                <th className="px-4 py-2">상태</th>
                <th className="px-4 py-2">생성일</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((it) => (
                <tr key={it.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{it.id}</td>
                  <td className="px-4 py-2">{it.instanceCode}</td>
                  <td className="px-4 py-2">{it.itemName}</td>
                  <td className="px-4 py-2">{it.status}</td>
                  <td className="px-4 py-2">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {instances.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3 py-1">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page + 1 >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
