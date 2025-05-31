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
  outbound: string;
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [outboundStatus, setOutboundStatus] = useState<string>("RETURN_PENDING");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetId, setModalTargetId] = useState<number | null>(null);
  const [modalFile, setModalFile] = useState<File | null>(null);

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
      if (outboundStatus !== "RETURN_PENDING") params.append("outboundStatus", outboundStatus);

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
        return "bg-green-50 text-green-600";
      case "RETURN_REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutboundStatusBadgeColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-blue-50 text-blue-600";
      case "DAMAGED":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
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
    setOutboundStatus("RETURN_PENDING");
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
                비품 반납 현황을 확인하고 관리할 수 있습니다.
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[130px] whitespace-nowrap">요청서 ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">반납 상태</th>
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
                        <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : !pageData || pageData.content.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-gray-500">표시할 반납 요청이 없습니다.</p>
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
                          {ret.approvalStatus === "RETURN_REJECTED" && "거절"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutboundStatusBadgeColor(ret.outbound)}`}>
                          {ret.outbound === "AVAILABLE" && "사용 가능"}
                          {ret.outbound === "DAMAGED" && "파손"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(ret.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {ret.approvalStatus === "RETURN_PENDING" && (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                              onClick={() => {
                                setModalTargetId(ret.id);
                                setModalFile(null);
                                setModalOpen(true);
                              }}
                            >
                              승인
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("정말 이 요청을 거절하시겠습니까?")) {
                                  handleStatusUpdate(ret.id, "RETURN_REJECTED", new File([], "dummy.jpg"));
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              거절
                            </button>
                          </div>
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

        {/* 사진 업로드 모달 */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 w-screen h-screen flex items-center justify-center">
            <div className="absolute inset-0 w-full h-full backdrop-blur-sm" />
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setModalOpen(false)} aria-label="닫기">&times;</button>
              <div className="mb-4 flex flex-col items-center">
                <svg className="w-12 h-12 text-[#0047AB] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586M16 7V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v4m-4 4v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                </svg>
                <h2 className="text-lg font-bold mb-1">승인 사진 업로드</h2>
                <p className="text-sm text-gray-500 mb-2 text-center">승인 처리를 위해 사진을 첨부해 주세요.<br/>이미지 파일만 업로드 가능합니다.</p>
              </div>
              <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 text-blue-600 rounded-lg shadow-md tracking-wide border border-blue-200 cursor-pointer hover:bg-blue-50 transition mb-3">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4m6 5a1 1 0 001-1v-4m-6 5a1 1 0 01-1-1v-4" />
                </svg>
                <span className="text-base leading-normal">사진 선택</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setModalFile(e.target.files?.[0] || null)} />
              </label>
              {modalFile && <div className="mb-3 text-sm text-gray-700">선택된 파일: <span className="font-medium">{modalFile.name}</span></div>}
              <div className="flex gap-2 w-full mt-2">
                <button
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0047AB] text-white font-semibold hover:bg-[#003380] disabled:opacity-50 transition"
                  disabled={!modalFile}
                  onClick={async () => {
                    if (modalTargetId && modalFile) {
                      await handleStatusUpdate(modalTargetId, "RETURNED", modalFile);
                      setModalOpen(false);
                    }
                  }}
                >
                  확인
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  onClick={() => setModalOpen(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 