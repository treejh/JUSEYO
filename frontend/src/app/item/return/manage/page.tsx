"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";
import Link from "next/link";

interface SupplyReturn {
  id: number;
  requestId: number | null;
  productName: string;
  quantity: number;
  purpose: string;
  approvalStatus: string;
  createdAt: string;
  outboundStatus: string;
}

interface PageResponse {
  content: SupplyReturn[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function ReturnManagePage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();
  const isManager = isLogin && loginUser?.role === "MANAGER";
  const toast = useCustomToast();

  const [pageData, setPageData] = useState<PageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [outboundStatus, setOutboundStatus] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 로그인/매니저 권한 체크
  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    } else if (!isManager) {
      router.push("/");
    }
  }, [isLogin, isManager, router]);

  // 서버에서 반납 요청 불러오기
  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(pageSize),
        approvalStatus: "RETURN_PENDING"
      });

      if (searchKeyword) params.append("search", searchKeyword);
      if (startDate) params.append("fromDate", startDate);
      if (endDate) params.append("toDate", endDate);
      if (outboundStatus !== "ALL") params.append("outboundStatus", outboundStatus);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/supply-return?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      const data: PageResponse = await res.json();
      setPageData(data);
    } catch (err: any) {
      toast.error(`로딩 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 반납 상태 변경
  const handleStatusUpdate = async (id: number, newStatus: string, image: File) => {
    if (processingIds.includes(id)) return;
    
    setProcessingIds((prev) => [...prev, id]);
    try {
      const formData = new FormData();
      formData.append("approvalStatus", newStatus);
      formData.append("image", image);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/supply-return/${id}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      await fetchReturns();
      toast.success("상태가 변경되었습니다.");
    } catch (err: any) {
      toast.error(`상태 변경 실패: ${err.message}`);
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [currentPage, searchKeyword, startDate, endDate, outboundStatus]);

  // 상태별 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "RETURN_PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "RETURNED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutboundStatusBadgeColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "DAMAGED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleReset = () => {
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
    setOutboundStatus("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                비품 반납 관리
              </h1>
              <p className="text-gray-600">
                직원들의 비품 반납 현황을 확인하고 관리할 수 있습니다.
              </p>
            </div>
            <Link
              href="/item/return"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB]"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              반납 목록으로
            </Link>
          </div>

          {/* 통계 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="bg-[#0047AB]/10 rounded-lg p-4 w-[250px]">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-[#0047AB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-[#0047AB]">대기 중인 반납</p>
                  <p className="text-2xl font-bold text-[#0047AB]">
                    {pageData?.content.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px] whitespace-nowrap">요청서 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">반납 상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">현재 상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">작성일</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin h-12 w-12 border-b-2 border-[#0047AB] rounded-full" />
                        <p className="mt-4 text-gray-500">반납 목록을 불러오는 중...</p>
                      </div>
                    </td>
                  </tr>
                ) : !pageData?.content.length ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-gray-500">처리할 반납 요청이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  pageData.content.map((ret, index) => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(pageData?.number ?? 0) * (pageData?.size ?? 0) + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ret.requestId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ret.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{ret.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(ret.approvalStatus)}`}>
                          {ret.approvalStatus === "RETURN_PENDING" && "반납 대기"}
                          {ret.approvalStatus === "RETURNED" && "반납 완료"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutboundStatusBadgeColor(ret.outboundStatus)}`}>
                          {ret.outboundStatus === "AVAILABLE" && "사용 가능"}
                          {ret.outboundStatus === "DAMAGED" && "파손"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(ret.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <label className="cursor-pointer text-[#0047AB] hover:text-[#003380] disabled:opacity-50 disabled:cursor-not-allowed">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={processingIds.includes(ret.id)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleStatusUpdate(ret.id, "RETURNED", file);
                              }
                            }}
                          />
                          반납 처리
                        </label>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {pageData && pageData.totalPages > 0 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-6 py-2 text-gray-700">
                페이지 {currentPage} / {pageData.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(pageData.totalPages, currentPage + 1))}
                disabled={currentPage >= pageData.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 