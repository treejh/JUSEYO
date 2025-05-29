"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

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

export default function SupplyRequestManageListPage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();
  const isManager = isLogin && loginUser?.role === "MANAGER";
  const toast = useCustomToast();

  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // 로그인/매니저 권한 체크
  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    } else if (!isManager) {
      router.push("/");
    }
  }, [isLogin, isManager, router]);

  // 서버에서 전체 요청 불러오기
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/supply-requests`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      const data: SupplyRequest[] = await res.json();
      setRequests(data);
    } catch (err: any) {
      toast.error(`로딩 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 요청 삭제
  const handleDeleteRequest = async (id: number) => {
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/supply-requests/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(await res.text());
      await fetchRequests();
    } catch (err: any) {
      toast.error(`삭제 실패: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 승인상태별 배지 색상
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

  // 날짜 포맷
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // 필터링 & 정렬
  const filteredRequests = requests
    .filter((req) => {
      // 승인상태 필터
      if (statusFilter !== "ALL" && req.approvalStatus !== statusFilter) {
        return false;
      }
      // 상품명 키워드 필터
      if (
        !req.productName.toLowerCase().includes(searchKeyword.toLowerCase())
      ) {
        return false;
      }
      // 작성일 필터
      const reqDate = new Date(req.createdAt);
      if (startDate && new Date(startDate) > reqDate) return false;
      if (endDate) {
        const endDt = new Date(endDate);
        endDt.setHours(23, 59, 59);
        if (endDt < reqDate) return false;
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
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                비품 요청 리스트
              </h1>
              <p className="text-gray-500 mt-1">
                직원들의 비품 요청 현황을 확인하고 관리할 수 있습니다.
              </p>
            </div>
            <Link
              href="/item/supplyrequest/manage"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0047AB] hover:bg-[#003d91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] transition-colors duration-200"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              요청 관리
            </Link>
          </div>
          {/* 통계 */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">전체 요청</p>
              <p className="text-2xl font-bold text-blue-900">
                {filteredRequests.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">대기 중</p>
              <p className="text-2xl font-bold text-yellow-900">
                {
                  filteredRequests.filter(
                    (r) => r.approvalStatus === "REQUESTED"
                  ).length
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">승인</p>
              <p className="text-2xl font-bold text-green-900">
                {
                  filteredRequests.filter(
                    (r) => r.approvalStatus === "APPROVED"
                  ).length
                }
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">반려</p>
              <p className="text-2xl font-bold text-red-900">
                {
                  filteredRequests.filter(
                    (r) => r.approvalStatus === "REJECTED"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        {/* 검색 / 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[240px]">
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
                  placeholder="상품명으로 검색"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <span className="text-gray-500">~</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="block w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="ALL">전체 승인상태</option>
                <option value="REQUESTED">대기 중</option>
                <option value="APPROVED">승인</option>
                <option value="REJECTED">반려</option>
              </select>

              <button
                onClick={() => {
                  setSearchKeyword("");
                  setStartDate("");
                  setEndDate("");
                  setStatusFilter("ALL");
                  setCurrentPage(0);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  className="mr-2 h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
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
