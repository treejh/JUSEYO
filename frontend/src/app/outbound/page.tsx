"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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
  const { loginUser, isLogin } = useGlobalLoginUser();

  // 로그인 전 리다이렉트
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  // 검색·필터 상태
  const [dateFrom, setDateFrom] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [outboundType, setOutboundType] = useState<string>("");

  // 데이터 상태
  const [data, setData] = useState<Page<OutboundItem> | null>(null);
  const [items, setItems] = useState<OutboundItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const size = 10;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 고유 카테고리 목록
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.categoryName))),
    [items]
  );

  // 출고 유형 목록
  const outboundTypes = [
    { value: "", label: "전체" },
    { value: "ISSUE", label: "지급" },
    { value: "LOST", label: "분실" },
    { value: "LEND", label: "대여" },
    { value: "REPAIR", label: "수리" },
    { value: "DISPOSAL", label: "폐기" },
    { value: "DAMAGED", label: "파손" },
  ];

  // 출고 유형별 스타일 매핑
  const getOutboundTypeStyle = (type: string): string => {
    switch (type) {
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

  // API 호출 (항상 /me 사용)
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const ep = "/api/v1/inventory-out/me";
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        fromDate: dateFrom,
        toDate: dateTo,
        search,
      });
      const url = `${base}${ep}?${params}`;
      console.log("Fetching Outbound:", url);
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Page<OutboundItem> = await res.json();
      setData(json);
      setItems(json.content);
    } catch (e) {
      console.error(e);
      setError(
        (e as Error).message.includes("403")
          ? "권한이 없습니다."
          : "출고내역 로드 실패"
      );
    } finally {
      setLoading(false);
    }
  };

  // 필터링 적용
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (!category || item.categoryName === category) &&
          (!outboundType || item.outbound === outboundType) &&
          (!search.trim() ||
            item.itemName.toLowerCase().includes(search.toLowerCase()) ||
            item.categoryName.toLowerCase().includes(search.toLowerCase()) ||
            item.id.toString().includes(search))
      ),
    [items, category, outboundType, search]
  );

  // 초기 및 파라미터 변화 시 호출
  useEffect(() => {
    load();
  }, [page, dateFrom, dateTo, search]);

  // 날짜 포맷터
  const fmt = (d: string) => {
    try {
      return format(new Date(d), "yyyy-MM-dd", { locale: ko });
    } catch {
      return d;
    }
  };

  // 엑셀 다운로드
  const downloadExcel = async () => {
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL;
      const params = new URLSearchParams({
        fromDate: dateFrom,
        toDate: dateTo,
      });
      const res = await fetch(`${base}/api/v1/inventory-out/export?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `출고내역_${dateFrom}_to_${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError("엑셀 다운로드 실패");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">출고 내역</h1>
          <p className="text-gray-500">
            비품의 출고 현황을 확인할 수 있습니다.
          </p>
        </div>
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          엑셀 다운로드
        </button>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-6 gap-6 mb-8">
        <div className="bg-slate-50/80 rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex flex-col">
            <div className="text-slate-500 text-sm font-medium mb-4">전체</div>
            <div className="text-4xl font-semibold text-slate-700 mb-1">
              {filtered.length}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              총 출고 건수
            </div>
          </div>
        </div>
        {outboundTypes.slice(1).map((type) => (
          <div
            key={type.value}
            className={`rounded-xl p-8 shadow-sm hover:translate-y-[-2px] transition-all duration-300
          ${type.value === "ISSUE" ? "bg-emerald-50/80" : ""}
          ${type.value === "LOST" ? "bg-red-50/80" : ""}
          ${type.value === "LEND" ? "bg-blue-50/80" : ""}
          ${type.value === "REPAIR" ? "bg-purple-50/80" : ""}
          ${type.value === "DISPOSAL" ? "bg-gray-50/80" : ""}
          ${type.value === "DAMAGED" ? "bg-amber-50/80" : ""}`}
          >
            <div className="flex flex-col">
              <div
                className={`text-sm font-medium mb-4
              ${type.value === "ISSUE" ? "text-emerald-600" : ""}
              ${type.value === "LOST" ? "text-red-600" : ""}
              ${type.value === "LEND" ? "text-blue-600" : ""}
              ${type.value === "REPAIR" ? "text-purple-600" : ""}
              ${type.value === "DISPOSAL" ? "text-gray-600" : ""}
              ${type.value === "DAMAGED" ? "text-amber-600" : ""}`}
              >
                {type.label}
              </div>
              <div
                className={`text-4xl font-semibold mb-1
              ${type.value === "ISSUE" ? "text-emerald-700" : ""}
              ${type.value === "LOST" ? "text-red-700" : ""}
              ${type.value === "LEND" ? "text-blue-700" : ""}
              ${type.value === "REPAIR" ? "text-purple-700" : ""}
              ${type.value === "DISPOSAL" ? "text-gray-700" : ""}
              ${type.value === "DAMAGED" ? "text-amber-700" : ""}`}
              >
                {filtered.filter((item) => item.outbound === type.value).length}
              </div>
              <div
                className={`text-xs font-medium
              ${type.value === "ISSUE" ? "text-emerald-500" : ""}
              ${type.value === "LOST" ? "text-red-500" : ""}
              ${type.value === "LEND" ? "text-blue-500" : ""}
              ${type.value === "REPAIR" ? "text-purple-500" : ""}
              ${type.value === "DISPOSAL" ? "text-gray-500" : ""}
              ${type.value === "DAMAGED" ? "text-amber-500" : ""}`}
              >
                {type.label} 건수
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex gap-6 items-center">
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">출고 일자</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">출고 유형</span>
            <select
              value={outboundType}
              onChange={(e) => setOutboundType(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {outboundTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">카테고리</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">전체</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 테이블 섹션 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                출고ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                요청서ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                출고 일자
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                카테고리
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                품목명
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                수량
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                출고 유형
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-600">{it.id}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {it.supplyRequestId}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {fmt(it.createdAt)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {it.categoryName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {it.itemName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {it.quantity}
                </td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getOutboundTypeStyle(
                      it.outbound
                    )}`}
                  >
                    {outboundTypes.find((o) => o.value === it.outbound)
                      ?.label || it.outbound}
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
        <span className="px-4 text-sm text-gray-700">
          {page + 1} / {data?.totalPages || 1}
        </span>
        <button
          onClick={() =>
            setPage((p) => Math.min((data?.totalPages || 1) - 1, p + 1))
          }
          disabled={page >= (data?.totalPages || 1) - 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
        <button
          onClick={() => setPage((data?.totalPages || 1) - 1)}
          disabled={page >= (data?.totalPages || 1) - 1}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          마지막
        </button>
      </div>
    </div>
  );
}
