"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

interface ItemInstance {
  id: number;
  itemName: string;
  instanceCode: string;
  outbound: string;
  status: string;
  createdAt: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export default function ItemInstancePage() {
  const router = useRouter();
  const { isLogin } = useGlobalLoginUser();

  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const loadInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        keyword: search.trim(),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/item-instances?${params}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Page<ItemInstance> = await res.json();
      setInstances(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
      setError("자산 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, [page]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">개별 자산 관리</h1>

      {/* 검색 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="코드 또는 품목명 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <button
          onClick={() => {
            setPage(0);
            loadInstances();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          검색
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">품목명</th>
                <th className="px-4 py-2">인스턴스 코드</th>
                <th className="px-4 py-2">출고 유형</th>
                <th className="px-4 py-2">상태</th>
                <th className="px-4 py-2">생성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instances.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{inst.id}</td>
                  <td className="px-4 py-2">{inst.itemName}</td>
                  <td className="px-4 py-2">{inst.instanceCode}</td>
                  <td className="px-4 py-2">{inst.outbound}</td>
                  <td className="px-4 py-2">{inst.status}</td>
                  <td className="px-4 py-2">
                    {new Date(inst.createdAt).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="flex justify-center items-center p-4 space-x-2">
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
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              다음
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              마지막
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
