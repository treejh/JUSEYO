"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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

export default function ManageSupplyRequestsPage() {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, action: "approve" | "reject") => {
    setProcessingIds((prev) => [...prev, id]);
    try {
      const url = `${API_BASE}/api/v1/supply-requests/${id}/${action}`;
      const res = await fetch(url, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(`서버 오류: ${await res.text()}`);
      // Refresh list after action
      await fetchPending();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                비품 요청 관리
              </h1>
              <p className="text-gray-500 mt-1">
                대기 중인 비품 요청을 승인하거나 거절할 수 있습니다.
              </p>
            </div>
            <Link
              href="/item/supplyrequest/list"
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
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

          {/* 통계 섹션 수정 */}
          <div className="flex mt-6">
            <div className="bg-blue-50 rounded-lg p-4 w-64">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-blue-600"
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
                  <p className="text-sm text-blue-600">대기 중인 요청</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {requests.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-500">요청 목록을 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "ID",
                      "상품명",
                      "수량",
                      "사유",
                      "사용일",
                      "반납일",
                      "대여여부",
                      "작성일",
                      "승인 / 거절",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.id}
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
                          className={`px-2 py-1 text-xs rounded-full ${
                            req.rental
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {req.rental ? "대여" : "지급"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => updateStatus(req.id, "approve")}
                          disabled={processingIds.includes(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 border border-green-200"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, "reject")}
                          disabled={processingIds.includes(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 border border-red-200"
                        >
                          거절
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {requests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                처리할 요청이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
