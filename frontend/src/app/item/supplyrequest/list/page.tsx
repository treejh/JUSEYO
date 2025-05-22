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

interface PageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function SupplyRequestListPage() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const isManager = isLogin && loginUser?.role === "MANAGER";
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10,
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/me`, {
        credentials: "include",
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`서버 오류: ${msg}`);
      }
      const data: SupplyRequest[] = await res.json();
      setRequests(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchRequests();
  }, []);

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
            <div className="flex gap-3">
              <Link
                href="/item/supplyrequest/create"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <span className="text-lg">+</span> 신규 요청
              </Link>
              {isManager && (
                <Link
                  href="/item/supplyrequest/manage"
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  요청 관리
                </Link>
              )}
            </div>
          </div>

          {/* 통계 섹션 */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">전체 요청</p>
              <p className="text-2xl font-bold text-blue-900">
                {requests.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">대기 중</p>
              <p className="text-2xl font-bold text-yellow-900">
                {
                  requests.filter((r) => r.approvalStatus === "REQUESTED")
                    .length
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">승인</p>
              <p className="text-2xl font-bold text-green-900">
                {requests.filter((r) => r.approvalStatus === "APPROVED").length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">반려</p>
              <p className="text-2xl font-bold text-red-900">
                {requests.filter((r) => r.approvalStatus === "REJECTED").length}
              </p>
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    상품명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    수량
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    사유
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    승인상태
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    작성일
                  </th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
