"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

interface ReturnRequest {
  id: number;
  requestId: number | null;
  productName: string;
  quantity: number;
  useDate: string;
  returnDate: string | null;
  approvalStatus: string;
  outbound: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function ReturnRequestListPage() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 20;
  const [totalPages, setTotalPages] = useState<number>(0);
  const toast = useCustomToast();

  // 내 반납 요청 목록 조회
  const fetchRequests = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/supply-return/my?page=${
          currentPage + 1
        }&size=${pageSize}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRequests(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setErrorMsg(`로딩 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 개별 요청 삭제
  const handleDeleteRequest = async (id: number) => {
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;
    setDeleteLoadingId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-return/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast.success("삭제되었습니다.");

      // 삭제 성공 후 목록 다시 불러오기
      await fetchRequests();
    } catch (err: any) {
      setErrorMsg(`삭제 실패: ${err.message}`);
      toast.error("삭제 실패");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // 로그인 시 데이터 로딩
  useEffect(() => {
    if (isLogin) fetchRequests();
  }, [isLogin, currentPage]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(0);
  }, [searchKeyword, startDate, endDate, statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "RETURN_PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "RETURN_REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  // 필터링 & 정렬
  const filteredRequests = requests
    .filter((req) => {
      if (!req.productName.toLowerCase().includes(searchKeyword.toLowerCase()))
        return false;
      if (startDate || endDate) {
        const reqDate = new Date(req.createdAt);
        if (startDate && new Date(startDate) > reqDate) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59);
          if (end < reqDate) return false;
        }
      }
      if (statusFilter !== "ALL" && req.approvalStatus !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const paginatedRequests = filteredRequests;

  const handleReset = () => {
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("ALL");
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                나의 반납 요청
              </h1>
              <p className="text-gray-600">
                내가 작성한 반납 요청 현황을 확인합니다.
              </p>
            </div>
            <Link
              href="/item/supplyeturn/create"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              신규 요청
            </Link>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">전체 요청</p>
              <p className="text-2xl font-bold text-blue-900">
                {filteredRequests.length}
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
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">반납 대기 중</p>
              <p className="text-2xl font-bold text-yellow-900">
                {
                  filteredRequests.filter(
                    (r) => r.approvalStatus === "RETURN_PENDING"
                  ).length
                }
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">반납 거부</p>
              <p className="text-2xl font-bold text-red-900">
                {
                  filteredRequests.filter(
                    (r) => r.approvalStatus === "RETURN_REJECTED"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* 검색 / 필터 섹션 */}
          <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="상품명으로 검색"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-gray-50"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반납 상태
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    <option value="ALL">전체</option>
                    <option value="RETURN_PENDING">반납 대기 중</option>
                    <option value="RETURNED">반납 완료</option>
                    <option value="REJECTED">반납 거절</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기간 선택
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-[#003380] transition-colors duration-200 whitespace-nowrap h-[38px]"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
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
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px]">
                    요청서ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                    사용일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                    반납일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    반납 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                    현재 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-8 w-8 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <p className="text-gray-500">표시할 요청이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((request, index) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.requestId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.productName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {request.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(request.useDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(request.returnDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            request.approvalStatus
                          )}`}
                        >
                          {request.approvalStatus === "RETURN_PENDING" &&
                            "반납 대기 중"}
                          {request.approvalStatus === "APPROVED" && "승인"}
                          {request.approvalStatus === "RETURN_REJECTED" &&
                            "반납 거부"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.outbound === "AVAILABLE"
                              ? "bg-blue-50 text-blue-600"
                              : request.outbound === "DAMAGED"
                              ? "bg-red-50 text-red-600"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {request.outbound === "AVAILABLE" && "사용 가능"}
                          {request.outbound === "DAMAGED" && "파손"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.approvalStatus === "RETURN_PENDING" && (
                          <>
                            <Link
                              href={`/item/supplyeturn/edit/${request.id}`}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              수정
                            </Link>
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
                              disabled={deleteLoadingId === request.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deleteLoadingId === request.id
                                ? "삭제 중..."
                                : "삭제"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-6 py-2 text-gray-700">
              페이지 {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
