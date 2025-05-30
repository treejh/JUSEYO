"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

interface SupplyRequest {
  id: number;
  requesterId: number;
  productName: string;
  quantity: number;
  purpose: string;
  useDate: string | null;
  returnDate: string | null;
  rental: boolean;
  approvalStatus: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
}

const STATUS_MAP: Record<string, string> = {
  REQUESTED: "대기중",
  RETURN_PENDING: "대여",
  APPROVED: "승인",
  REJECTED: "거절",
};

export default function SupplyRequestManageListPage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();
  const isManager = isLogin && loginUser?.role === "MANAGER";
  const toast = useCustomToast();

  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!isLogin) router.push("/login");
    else if (!isManager) router.push("/");
  }, [isLogin, isManager, router]);

  const fetchRequests = async () => {
    setLoading(true);
    let data: SupplyRequest[] = [];
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/supply-requests`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(await res.text());
      data = await res.json();
      setRequests(data);
    } catch (err: any) {
      toast.error(`요청 불러오기 실패: ${err.message}`);
      setLoading(false);
      return;
    }
    try {
      const ids = Array.from(new Set(data.map((r) => r.requesterId)));
      if (ids.length) {
        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users?ids=${ids.join(
            ","
          )}`,
          { credentials: "include" }
        );
        if (!userRes.ok) throw new Error(await userRes.text());
        const users: User[] = await userRes.json();
        const map: Record<number, string> = {};
        users.forEach((u) => {
          map[u.id] = u.name;
        });
        setUserMap(map);
      }
    } catch (err: any) {
      console.warn("사용자명 매핑 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/supply-requests/${id}`,
        { method: "DELETE", credentials: "include" }
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

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString() : "-";

  const filtered = requests
    .filter((req) => {
      if (statusFilter !== "ALL" && req.approvalStatus !== statusFilter)
        return false;
      if (!req.productName.toLowerCase().includes(searchKeyword.toLowerCase()))
        return false;
      const dt = new Date(req.createdAt);
      if (startDate && new Date(startDate) > dt) return false;
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23, 59, 59);
        if (ed < dt) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIdx = currentPage * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                비품 요청 리스트
              </h1>
              <p className="text-gray-500 mt-1">직원들의 요청 현황을 관리</p>
            </div>
            <Link
              href="/item/supplyrequest/manage"
              className="inline-flex items-center px-4 py-2 bg-[#0047AB] text-white rounded-lg"
            >
              요청 관리
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">전체 요청</p>
              <p className="text-2xl font-bold text-blue-900">
                {filtered.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">대기중</p>
              <p className="text-2xl font-bold text-yellow-900">
                {
                  filtered.filter((r) => r.approvalStatus === "REQUESTED")
                    .length
                }
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">대여</p>
              <p className="text-2xl font-bold text-blue-900">
                {
                  filtered.filter((r) => r.approvalStatus === "RETURN_PENDING")
                    .length
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">승인</p>
              <p className="text-2xl font-bold text-green-900">
                {filtered.filter((r) => r.approvalStatus === "APPROVED").length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">거절</p>
              <p className="text-2xl font-bold text-red-900">
                {filtered.filter((r) => r.approvalStatus === "REJECTED").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="상품명 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 1114 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">전체 승인상태</option>
              <option value="REQUESTED">대기중</option>
              <option value="RETURN_PENDING">대여</option>
              <option value="APPROVED">승인</option>
              <option value="REJECTED">거절</option>
            </select>
            <button
              onClick={() => {
                setSearchKeyword("");
                setStartDate("");
                setEndDate("");
                setStatusFilter("ALL");
                setCurrentPage(0);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              초기화
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-500">데이터 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      순번
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
                      승인상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      반납일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map((req, idx) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {startIdx + idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userMap[req.requesterId] ?? "알 수 없음"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {req.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {req.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            req.approvalStatus
                          )}`}
                        >
                          {STATUS_MAP[req.approvalStatus] ?? req.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(req.returnDate)}
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
            </div>
            <div className="flex justify-between items-center px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                총 {filtered.length}개 항목
              </div>
              <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>
    </main>
  );
}
