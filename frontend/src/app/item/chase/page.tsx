// src/app/item/chase/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

interface ChaseLog {
  id: number;
  requestId: number;
  productName: string;
  quantity: number;
  issue: string;
  createdAt: string;
}

export default function ChaseItemPage() {
  const router = useRouter();
  const { isLogin } = useGlobalLoginUser(); // ← selector 제거, 인자 없이 호출

  // 로그인 체크 후 미로그인 시 /login으로 리다이렉트
  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    }
  }, [isLogin, router]);

  if (!isLogin) return null;

  const [allLogs, setAllLogs] = useState<ChaseLog[]>([]);
  const [logs, setLogs] = useState<ChaseLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const size = 20;

  // 전체 조회 API 호출
  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chase-items`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      const data: ChaseLog[] = await res.json();
      setAllLogs(data);
    } catch (e: any) {
      console.error(e);
      setError("추적 로그를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // 필터 및 페이징 적용
  useEffect(() => {
    let filtered = allLogs;

    if (search.trim()) {
      const t = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.productName.toLowerCase().includes(t) ||
          log.issue.toLowerCase().includes(t)
      );
    }
    if (fromDate) {
      const f = new Date(fromDate);
      filtered = filtered.filter((log) => new Date(log.createdAt) >= f);
    }
    if (toDate) {
      const t = new Date(toDate);
      t.setHours(23, 59, 59);
      filtered = filtered.filter((log) => new Date(log.createdAt) <= t);
    }

    const start = page * size;
    setLogs(filtered.slice(start, start + size));
  }, [allLogs, search, fromDate, toDate, page]);

  // 전체 페이지 수 계산
  const totalFiltered = allLogs.filter((log) => {
    if (search.trim()) {
      const t = search.toLowerCase();
      if (
        !log.productName.toLowerCase().includes(t) &&
        !log.issue.toLowerCase().includes(t)
      )
        return false;
    }
    const d = new Date(log.createdAt);
    if (fromDate && new Date(fromDate) > d) return false;
    if (toDate) {
      const t = new Date(toDate);
      t.setHours(23, 59, 59);
      if (t < d) return false;
    }
    return true;
  }).length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / size));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          전체 비품 추적 로그
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          비품의 이력과 현재 상태를 추적할 수 있습니다.
        </p>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
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
              <input
                type="text"
                placeholder="품목명 또는 이슈 검색"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setPage(0)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              조회
            </button>
          </div>
        </div>
      </div>

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

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["ID", "요청ID", "품목명", "수량", "이슈", "일시"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.requestId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.issue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                총 <span className="font-medium">{totalFiltered}</span> 건
              </div>
              <div className="flex items-center space-x-2">
                {[
                  {
                    label: "처음",
                    onClick: () => setPage(0),
                    disabled: page === 0,
                  },
                  {
                    label: "이전",
                    onClick: () => setPage((p) => Math.max(0, p - 1)),
                    disabled: page === 0,
                  },
                  {
                    label: "다음",
                    onClick: () =>
                      setPage((p) => Math.min(totalPages - 1, p + 1)),
                    disabled: page >= totalPages - 1,
                  },
                  {
                    label: "마지막",
                    onClick: () => setPage(totalPages - 1),
                    disabled: page >= totalPages - 1,
                  },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    disabled={btn.disabled}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
