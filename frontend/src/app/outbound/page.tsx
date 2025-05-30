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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                출고 내역
              </h1>
              <p className="text-gray-600">
                비품의 출고 이력을 조회하고 관리할 수 있습니다.
              </p>
            </div>
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
                    a.download = `출고내역_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(href);
                  })
                  .catch(() => setError("엑셀 다운로드 실패"));
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0047AB] hover:bg-[#003380] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] transition-colors duration-200 whitespace-nowrap"
            >
              <svg
                className="mr-2 h-4 w-4"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">전체 출고</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">{filtered.length}</span>
                <span className="text-xs text-gray-500">총 출고 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">지급</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">
                  {filtered.filter(i => i.outbound === 'ISSUE').length}
                </span>
                <span className="text-xs text-gray-500">지급 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">대여</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">
                  {filtered.filter(i => i.outbound === 'LEND').length}
                </span>
                <span className="text-xs text-gray-500">대여 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">폐기</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">
                  {filtered.filter(i => i.outbound === 'DISPOSAL').length}
                </span>
                <span className="text-xs text-gray-500">폐기 건수</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#0047AB] transition-all duration-200">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#0047AB]/10 rounded-lg">
                    <svg className="w-5 h-5 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600">기타</span>
                </div>
                <span className="text-3xl font-semibold text-gray-900 mb-1">
                  {filtered.filter(i => !['ISSUE', 'LEND', 'DISPOSAL'].includes(i.outbound)).length}
                </span>
                <span className="text-xs text-gray-500">기타 건수</span>
              </div>
            </div>
          </div>

          {/* 검색 / 필터 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">기간 선택</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setPage(0);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setPage(0);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">출고 유형</label>
                  <select
                    value={outType}
                    onChange={(e) => {
                      setOutType(e.target.value);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    {outboundTypes.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    <option value="">카테고리</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="비품명으로 검색"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[200px]">비품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">출고 유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">출고일</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0047AB] mb-4" />
                        <p className="text-sm text-gray-500">데이터를 불러오는 중입니다...</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm text-gray-500">표시할 출고 내역이 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page * size + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
                        <div className="text-sm text-gray-900 truncate">{item.itemName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.categoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyle(item.outbound)}`}>
                          {outboundTypes.find(t => t.value === item.outbound)?.label || item.outbound}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{fmt(item.createdAt)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {data && data.totalPages > 0 && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                disabled={page >= data.totalPages - 1}
                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
