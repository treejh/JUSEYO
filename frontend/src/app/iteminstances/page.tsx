"use client";

import React, { useEffect, useState } from "react";

interface ItemInstance {
  id: number;
  itemName: string;
  borrowedCount: number;
  status: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const pageSize = 20;

export default function ItemInstancesPage() {
  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  /** 목록 조회 */
  const fetchInstances = async (p = 0) => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/v1/item-instances?page=${p}&size=${pageSize}&keyword=${encodeURIComponent(
        keyword
      )}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `서버 오류: ${res.status}`);
      }
      const data: any = await res.json();
      // Page<ItemInstanceResponseDto> 또는 배열 처리
      let list: ItemInstance[] = Array.isArray(data)
        ? data
        : data.content ?? [];
      // 최신 순으로 정렬
      list = list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInstances(list);
      setTotalPages(Array.isArray(data) ? 1 : data.totalPages ?? 1);
      setPage(p);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstances(0);
  };

  return (
    <div className="min-h-screen flex items-start justify-center py-10 px-4 bg-gray-100">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-6">개별 자산 목록</h1>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="비품명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            검색
          </button>
        </form>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 border">ID</th>
                <th className="px-3 py-2 border">비품명</th>
                <th className="px-3 py-2 border text-center">대여 수량</th>
                <th className="px-3 py-2 border text-center">상태</th>
                <th className="px-3 py-2 border">생성일</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 border">{item.id}</td>
                  <td className="px-3 py-2 border">{item.itemName}</td>
                  <td className="px-3 py-2 border text-center">
                    {item.borrowedCount}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border">
                    {item.createdAt.slice(0, 10)}
                  </td>
                </tr>
              ))}
              {instances.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        <div className="mt-4 flex justify-between items-center">
          <button
            disabled={page === 0}
            onClick={() => fetchInstances(page - 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            ◀ Prev
          </button>
          <span className="text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchInstances(page + 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
