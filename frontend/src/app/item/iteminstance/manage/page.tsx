"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

// API 반환 DTO
interface ItemInstance {
  id: number;
  itemName: string;
  instanceCode: string;
  outbound: string;
  status: string;
  borrowerName?: string;
  returnDate?: string; // 반납일 필드
  createdAt: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export default function ItemInstanceManagePage() {
  const router = useRouter();
  const { isLogin } = useGlobalLoginUser();

  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // 로그인 체크
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  // 서버에서 페이지 단위로 불러온 뒤, 최신순 정렬
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
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/v1/item-instances?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Page<any> = await res.json();

      const mapped: ItemInstance[] = data.content
        .map((r: any) => ({
          id: r.id,
          itemName: r.itemName,
          instanceCode: r.instanceCode,
          outbound: r.outbound,
          status: r.status,
          borrowerName: r.borrowerName ?? r.borrower_name,
          returnDate:
            r.returnDate ??
            r.return_date ??
            r.supplyRequest?.returnDate ??
            r.supply_request?.return_date,
          createdAt: r.createdAt,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setInstances(mapped);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
      setError("자산 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    if (isLogin) loadInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleSearch = () => {
    setPage(0);
    loadInstances();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">개별 자산 관리</h1>
        <p className="text-gray-500">
          비품의 개별 자산 현황을 확인할 수 있습니다.
        </p>
      </div>

      {/* 검색 */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="코드 또는 품목명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            검색
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "ID",
                    "품목명",
                    "인스턴스 코드",
                    "출고 유형",
                    "상태",
                    "대여자",
                    "반납일", // 수량 헤더 제거
                    "생성일",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {instances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {inst.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      {inst.itemName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {inst.instanceCode}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {inst.outbound}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {inst.borrowerName ?? "–"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {inst.returnDate
                        ? new Date(inst.returnDate).toLocaleDateString("ko-KR")
                        : "–"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(inst.createdAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="p-4 border-t border-gray-200 flex justify-center items-center space-x-2">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              처음
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              다음
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              마지막
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
