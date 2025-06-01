"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomToast } from "@/utils/toast";

interface SupplyRequest {
  id: number;
  /** ← 추가 */
  userName: string; // 요청자 이름
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

export default function ManageSupplyRequestsPage() {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const toast = useCustomToast();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/pending`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`서버 오류: ${await res.text()}`);
      const data: SupplyRequest[] = await res.json();
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, action: "approve" | "reject") => {
    if (processingIds.includes(id)) return;
    setProcessingIds((prev) => [...prev, id]);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/supply-requests/${id}/${action}`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error(`서버 오류: ${await res.text()}`);

      toast.success(action === "approve" ? "신청 승인 완료" : "신청 거절 완료");
      await fetchPending();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                비품 신청 관리
              </h1>
              <p className="text-gray-600">
                비품 신청 현황을 관리할 수 있습니다.
              </p>
            </div>
            <Link
              href="/item/supplyrequest/list/manage"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
              요청 목록으로
            </Link>
          </div>

          {/* 통계 */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="bg-[#0047AB]/10 rounded-lg p-4 w-[300px]">
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
                  <p className="text-sm text-[#0047AB]">대기 중인 요청</p>
                  <p className="text-2xl font-bold text-[#0047AB]">
                    {requests.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm">
            <div className="animate-spin h-12 w-12 border-b-2 border-[#0047AB] rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">신청 목록을 불러오는 중...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">처리할 요청이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      요청자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      상품명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      수량
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      사유
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      사용일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      반납일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      신청유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.userName}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.useDate ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.returnDate ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            req.rental
                              ? "bg-[#0047AB]/10 text-[#0047AB]"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {req.rental ? "대여" : "지급"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => updateStatus(req.id, "approve")}
                            disabled={processingIds.includes(req.id)}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => updateStatus(req.id, "reject")}
                            disabled={processingIds.includes(req.id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            거절
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
