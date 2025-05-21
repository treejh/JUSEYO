"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  availableQuantity?: number;
  location?: string;
  purchase_source?: string; // snake_case
  purchaseSource?: string; // camelCase
  serialNumber?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const pageSize = 20;

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Excel 다운로드 ──────────────────────────
  const downloadExcel = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/v1/export/items`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`서버 오류: ${msg}`);
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "items.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── 데이터 조회 ────────────────────────────
  const fetchItems = async (p = 0) => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/v1/items?page=${p}&size=${pageSize}&keyword=${encodeURIComponent(
        keyword
      )}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`서버 오류: ${msg}`);
      }
      const json: any = await res.json();
      const list = Array.isArray(json) ? json : json.content ?? [];
      setItems(list);
      setPage(p);
      setTotalPages(json.totalPages ?? 1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold">비품 목록</h1>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={downloadExcel}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Excel 다운로드
            </button>
            <Link
              href="/item/supplyrequest"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              비품 요청서
            </Link>
          </div>
        </div>

        {/* 검색 바 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded"
            placeholder="비품명·카테고리 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchItems(0)}
          />
          <button
            onClick={() => fetchItems(0)}
            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800"
          >
            검색
          </button>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 border text-center">#</th>
                <th className="px-3 py-2 border">이름</th>
                <th className="px-3 py-2 border">카테고리</th>
                <th className="px-3 py-2 border">위치</th>
                <th className="px-3 py-2 border">구매처</th>
                <th className="px-3 py-2 border">시리얼</th>
                <th className="px-3 py-2 border text-center">총수량</th>
                <th className="px-3 py-2 border text-center">잔여수량</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border hover:bg-gray-50">
                  <td className="px-3 py-2 border text-center">
                    {idx + 1 + page * pageSize}
                  </td>
                  <td className="px-3 py-2 border">{item.name}</td>
                  <td className="px-3 py-2 border">{item.categoryName}</td>
                  <td className="px-3 py-2 border">{item.location ?? "-"}</td>
                  <td className="px-3 py-2 border">
                    {item.purchase_source ?? item.purchaseSource ?? "-"}
                  </td>
                  <td className="px-3 py-2 border">
                    {item.serialNumber ?? "-"}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {item.totalQuantity}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {item.availableQuantity ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        <div className="flex justify-end items-center gap-4 mt-4">
          <button
            onClick={() => page > 0 && fetchItems(page - 1)}
            disabled={page === 0}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => page + 1 < totalPages && fetchItems(page + 1)}
            disabled={page + 1 >= totalPages}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Next
          </button>
        </div>

        {loading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}
      </div>
    </main>
  );
}
