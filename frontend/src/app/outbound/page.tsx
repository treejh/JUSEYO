// app/outbound/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

// API 반환 DTO
interface OutboundItem {
  id: number;
  supplyRequestId: number;
  itemId: number;
  categoryId: number;
  managementId: number;
  quantity: number;
  outbound: string;
  createdAt: string;
  modifiedAt: string;
  categoryName: string;
  itemName: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export default function OutboundPage() {
  const router = useRouter();
  const { isLogin } = useGlobalLoginUser();

  // 로그인 전 리다이렉트
  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    }
  }, [isLogin, router]);
  if (!isLogin) return null;

  // --- 필터 상태 ---
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [outType, setOutType] = useState<string>("");

  // --- 페이징/데이터 상태 ---
  const [data, setData] = useState<Page<OutboundItem> | null>(null);
  const [items, setItems] = useState<OutboundItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const size = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리, 출고유형 목록
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoryName))),
    [items]
  );
  const outboundTypes = [
    { value: "", label: "전체" },
    { value: "ISSUE", label: "지급" },
    { value: "LOST", label: "분실" },
    { value: "LEND", label: "대여" },
    { value: "REPAIR", label: "수리" },
    { value: "DISPOSAL", label: "폐기" },
    { value: "DAMAGED", label: "파손" },
  ];
  const getStyle = (t: string): string => {
    switch (t) {
      case "ISSUE":
        return "bg-emerald-100 text-emerald-800";
      case "LOST":
        return "bg-red-100 text-red-800";
      case "LEND":
        return "bg-blue-100 text-blue-800";
      case "REPAIR":
        return "bg-purple-100 text-purple-800";
      case "DISPOSAL":
        return "bg-gray-100 text-gray-800";
      case "DAMAGED":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // --- 전체 출고내역 조회 함수 ---
  const load = async () => {
    setLoading(true);
    setError(null);

    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const ep = "/api/v1/inventory-out";
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("size", String(size));
    params.append("sortField", "createdAt");
    params.append("sortDir", "desc");
    if (search.trim()) params.append("search", search);
    if (dateFrom) params.append("fromDate", dateFrom);
    if (dateTo) params.append("toDate", dateTo);

    try {
      const res = await fetch(`${base}${ep}?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Page<OutboundItem> = await res.json();
      setData(json);
      setItems(json.content);
    } catch (e) {
      console.error(e);
      setError("전체 출고내역 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 필터/페이징 변경 시 재조회
  useEffect(() => {
    load();
  }, [page, dateFrom, dateTo, search]);

  // UI 단 클라이언트 필터링
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (!category || i.categoryName === category) &&
          (!outType || i.outbound === outType) &&
          (!search.trim() ||
            i.itemName.toLowerCase().includes(search.toLowerCase()) ||
            i.categoryName.toLowerCase().includes(search.toLowerCase()) ||
            i.id.toString().includes(search))
      ),
    [items, category, outType, search]
  );

  const fmt = (d: string) => {
    try {
      return format(new Date(d), "yyyy-MM-dd");
    } catch {
      return d;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">전체 출고내역</h1>
          <p className="text-gray-500">
            관리 대시보드 소속 모든 출고내역입니다.
          </p>
        </div>
        {/* 엑셀 다운로드 */}
        <button
          onClick={() => {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL;
            const ep = "/api/v1/inventory-out/export";
            const params = new URLSearchParams({
              fromDate: dateFrom,
              toDate: dateTo,
            });
            fetch(`${base}${ep}?${params.toString()}`, {
              credentials: "include",
            })
              .then((r) => {
                if (!r.ok) throw new Error();
                return r.blob();
              })
              .then((blob) => {
                const href = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = href;
                a.download = `전체출고내역_${dateFrom}_to_${dateTo}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(href);
              })
              .catch(() => setError("엑셀 다운로드 실패"));
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          엑셀 다운로드
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white p-6 rounded shadow mb-6 flex flex-wrap gap-4">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 flex-1 rounded"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={outType}
          onChange={(e) => {
            setOutType(e.target.value);
            setPage(0);
          }}
          className="border px-3 py-2 rounded"
        >
          {outboundTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setPage(0);
            load();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          조회
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* 테이블 */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">출고ID</th>
              <th className="px-4 py-2">요청서ID</th>
              <th className="px-4 py-2">일자</th>
              <th className="px-4 py-2">카테고리</th>
              <th className="px-4 py-2">품목</th>
              <th className="px-4 py-2">수량</th>
              <th className="px-4 py-2">유형</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{it.id}</td>
                <td className="px-4 py-2">{it.supplyRequestId}</td>
                <td className="px-4 py-2">{fmt(it.createdAt)}</td>
                <td className="px-4 py-2">{it.categoryName}</td>
                <td className="px-4 py-2">{it.itemName}</td>
                <td className="px-4 py-2">{it.quantity}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStyle(
                      it.outbound
                    )}`}
                  >
                    {outboundTypes.find((o) => o.value === it.outbound)?.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => setPage(0)}
          disabled={page === 0}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          처음
        </button>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-4">
          {page + 1} / {data?.totalPages ?? 1}
        </span>
        <button
          onClick={() =>
            setPage((p) => Math.min((data?.totalPages ?? 1) - 1, p + 1))
          }
          disabled={page >= (data?.totalPages ?? 1) - 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
        <button
          onClick={() => setPage((data?.totalPages ?? 1) - 1)}
          disabled={page >= (data?.totalPages ?? 1) - 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          마지막
        </button>
      </div>
    </div>
  );
}
