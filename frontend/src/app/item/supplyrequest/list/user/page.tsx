"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

interface SupplyRequest {
  id: number;
  productName: string;
  quantity: number;
  purpose: string;
  useDate: string | null;
  returnDate: string | null;
  rental: boolean;
  approvalStatus: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function SupplyRequestUserListPage() {
  const { loginUser, isLogin } = useGlobalLoginUser();

  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const STATUS_MAP: Record<string, string> = {
    ALL: "전체 승인상태",
    REQUESTED: "대기중",
    RETURN_PENDING: "대여중",
    APPROVED: "승인",
    REJECTED: "거절",
  };

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/me`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setRequests(await res.json());
    } catch (err: any) {
      setErrorMsg(`로딩 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;
    setDeleteLoadingId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchRequests();
    } catch (err: any) {
      setErrorMsg(`삭제 실패: ${err.message}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  useEffect(() => {
    if (isLogin) fetchRequests();
  }, [isLogin]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchKeyword, startDate, endDate, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "RETURN_PENDING":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleDateString("ko-KR") : "-";

  const filteredRequests = requests
    .filter((req) => {
      if (statusFilter !== "ALL" && req.approvalStatus !== statusFilter)
        return false;
      if (!req.productName.toLowerCase().includes(searchKeyword.toLowerCase()))
        return false;
      if (startDate || endDate) {
        const d = new Date(req.createdAt);
        if (startDate && new Date(startDate) > d) return false;
        if (endDate) {
          const ed = new Date(endDate);
          ed.setHours(23, 59, 59);
          if (ed < d) return false;
        }
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIdx = currentPage * pageSize;
  const paginatedRequests = filteredRequests.slice(
    startIdx,
    startIdx + pageSize
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 요약 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                나의 비품 요청
              </h1>
              <p className="text-gray-500 mt-1">
                내가 작성한 비품 요청 현황을 확인합니다.
              </p>
            </div>
            <Link
              href="/item/supplyrequest/create"
              className="inline-flex items-center px-4 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-[#003d91] transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              신규 요청
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <StatCard
              label="전체 요청"
              value={filteredRequests.length}
              color="blue"
            />
            <StatCard
              label="대기중"
              value={
                filteredRequests.filter((r) => r.approvalStatus === "REQUESTED")
                  .length
              }
              color="yellow"
            />
            <StatCard
              label="대여중"
              value={
                filteredRequests.filter(
                  (r) => r.approvalStatus === "RETURN_PENDING"
                ).length
              }
              color="blue"
            />
            <StatCard
              label="승인"
              value={
                filteredRequests.filter((r) => r.approvalStatus === "APPROVED")
                  .length
              }
              color="green"
            />
            <StatCard
              label="거절"
              value={
                filteredRequests.filter((r) => r.approvalStatus === "REJECTED")
                  .length
              }
              color="red"
            />
          </div>
        </div>

        {/* 검색/필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="상품명으로 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0047AB]"
              />
              <span className="text-gray-500">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0047AB]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0047AB] bg-white"
            >
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchKeyword("");
                setStartDate("");
                setEndDate("");
                setStatusFilter("ALL");
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "번호",
                    "상품명",
                    "수량",
                    "대여여부",
                    "사용일",
                    "반납일",
                    "상태",
                    "작성일",
                    "관리",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      로딩중...
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      표시할 요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((r, i) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {startIdx + i + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {r.productName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {r.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {r.rental ? "대여" : "구매"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(r.useDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(r.returnDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            r.approvalStatus
                          )}`}
                        >
                          {STATUS_MAP[r.approvalStatus] ?? r.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {r.approvalStatus === "REQUESTED" ? (
                          <>
                            <Link
                              href={`/item/supplyrequest/edit/${r.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              수정
                            </Link>
                            <button
                              onClick={() => handleDeleteRequest(r.id)}
                              disabled={deleteLoadingId === r.id}
                              className="text-red-600 hover:underline disabled:opacity-50"
                            >
                              삭제
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              총 {filteredRequests.length}개 항목
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(0)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                처음
              </button>
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm">
                {currentPage + 1} / {totalPages || 1}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                다음
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(totalPages - 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50"
              >
                마지막
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const bg =
    color === "blue"
      ? "bg-blue-50 text-blue-900"
      : color === "yellow"
      ? "bg-yellow-50 text-yellow-900"
      : color === "green"
      ? "bg-green-50 text-green-900"
      : "bg-red-50 text-red-900";
  const txt =
    color === "blue"
      ? "text-blue-600"
      : color === "yellow"
      ? "text-yellow-600"
      : color === "green"
      ? "text-green-600"
      : "text-red-600";
  return (
    <div className={`${bg} rounded-lg p-4`}>
      <p className={`text-sm ${txt}`}>{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
