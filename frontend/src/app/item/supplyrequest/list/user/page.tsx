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

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 20;

  // 내 요청 목록 조회
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setRequests(await res.json());
    } catch (err: any) {
      alert(`로딩 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 개별 요청 삭제
  const handleDeleteRequest = async (id: number) => {
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      await fetchRequests();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isLogin) fetchRequests();
  }, [isLogin]);

  // 페이지 초기화 on filter change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchKeyword, startDate, endDate]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // 필터링 & 정렬
  const filteredRequests = requests
    .filter((req) => {
      const matchesKeyword = req.productName
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      if (!matchesKeyword) return false;
      if (startDate || endDate) {
        const reqDate = new Date(req.createdAt);
        if (startDate && new Date(startDate) > reqDate) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59);
          if (end < reqDate) return false;
        }
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // 페이징
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIdx = currentPage * pageSize;
  const paginatedRequests = filteredRequests.slice(
    startIdx,
    startIdx + pageSize
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">나의 비품 요청</h1>
              <p className="text-gray-500 mt-1">
                내가 작성한 비품 요청 현황을 확인합니다.
              </p>
            </div>
            <Link
              href="/item/supplyrequest/create"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <span className="text-lg">+</span> 신규 요청
            </Link>
          </div>
        </div>

        {/* 검색 / 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <input
                type="text"
                placeholder="상품명으로 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
            <div className="flex items-center gap-2 min-w-[500px]">
              <span className="text-gray-600">작성일:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    순번
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사유
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    승인상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRequests.map((req, idx) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {startIdx + idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {req.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          req.approvalStatus
                        )}`}
                      >
                        {req.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
                      {req.approvalStatus === "REQUESTED" ? (
                        <>
                          <Link
                            href={`/item/supplyrequest/edit/${req.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="text-red-600 hover:underline"
                          >
                            삭제
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* 페이지네이션 */}
            <div className="flex justify-end items-center space-x-2 p-4">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(0)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                First
              </button>
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2">
                Page {currentPage + 1} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(totalPages - 1)}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
