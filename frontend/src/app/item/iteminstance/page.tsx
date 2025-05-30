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

export default function ItemInstancePage() {
  const router = useRouter();
  const { isLogin, loginUser } = useGlobalLoginUser();
  const size = 20;

  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 전체 페이지 수는 사용자 필터링 후 계산
  const [totalPages, setTotalPages] = useState(1);

  // 로그인 체크
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  // 서버에서 페이지 단위로 불러온 뒤, 최신순으로 정렬
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
    loadInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // 내가 대여한 항목만 필터링
  const filteredByMe = instances.filter(
    (inst) => inst.borrowerName === (loginUser as any)?.name
  );

  // pagination for filtered list
  const startIdx = page * size;
  const rows = filteredByMe.slice(startIdx, startIdx + size);
  const pages = Math.max(1, Math.ceil(filteredByMe.length / size));

  // 검색 핸들러
  const handleSearch = () => {
    setPage(0);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          개별 자산 관리
        </h1>
        <p className="text-gray-500">개별 자산 현황을 확인할 수 있습니다.</p>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="코드 또는 품목명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    "반납일",
                    "생성일",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((inst) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
                      {inst.returnDate
                        ? new Date(inst.returnDate).toLocaleDateString("ko-KR")
                        : "–"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(inst.createdAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
                {filteredByMe.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      대여한 자산이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-center items-center space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(0)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                처음
              </button>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                이전
              </button>
              <button
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                다음
              </button>
              <button
                disabled={page >= pages - 1}
                onClick={() => setPage(pages - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                마지막
              </button>
            </div>
            <div className="mt-3 text-sm text-center text-gray-500">
              페이지 {page + 1} / {pages}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
