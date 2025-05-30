"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

interface SupplyRequest {
  id: number;
  userId: number; // 요청자 ID
  userName: string; // 백엔드에서 내려주는 사용자 이름
  productName: string;
  quantity: number;
  purpose: string;
  useDate: string | null;
  returnDate: string | null;
  rental: boolean;
  approvalStatus: string;
  createdAt: string;
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
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // 로그인/권한 체크
  useEffect(() => {
    if (!isLogin) router.push("/login");
    else if (!isManager) router.push("/");
  }, [isLogin, isManager, router]);

  // 요청 데이터 로딩
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

  // 삭제 핸들러
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

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : "-";

  // 필터 & 정렬
  const filtered = requests
    .filter((r) => {
      if (statusFilter !== "ALL" && r.approvalStatus !== statusFilter)
        return false;
      if (!r.productName.toLowerCase().includes(searchKeyword.toLowerCase()))
        return false;
      const dt = new Date(r.createdAt);
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
        {/* 요약 카드 */}
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
            <StatCard label="전체 요청" value={filtered.length} color="blue" />
            <StatCard
              label="대기중"
              value={
                filtered.filter((r) => r.approvalStatus === "REQUESTED").length
              }
              color="yellow"
            />
            <StatCard
              label="대여"
              value={
                filtered.filter((r) => r.approvalStatus === "RETURN_PENDING")
                  .length
              }
              color="blue"
            />
            <StatCard
              label="승인"
              value={
                filtered.filter((r) => r.approvalStatus === "APPROVED").length
              }
              color="green"
            />
            <StatCard
              label="거절"
              value={
                filtered.filter((r) => r.approvalStatus === "REJECTED").length
              }
              color="red"
            />
          </div>
        </div>

        {/* 검색/필터 */}
        <FilterBar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          statusFilter={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setCurrentPage(0);
          }}
          onReset={() => {
            setSearchKeyword("");
            setStartDate("");
            setEndDate("");
            setStatusFilter("ALL");
            setCurrentPage(0);
          }}
        />

        {/* 테이블 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto rounded-full" />
            <p className="mt-4 text-gray-500">데이터 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "순번",
                      "요청자",
                      "상품명",
                      "수량",
                      "사유",
                      "승인상태",
                      "작성일",
                      "반납일",
                      "관리",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map((r, i) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {startIdx + i + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {r.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {r.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            r.approvalStatus
                          )}`}
                        >
                          {STATUS_MAP[r.approvalStatus] ?? r.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(r.returnDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-4">
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={filtered.length}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </main>
  );
}

// 통계 카드 컴포넌트
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

// 필터 바 컴포넌트
function FilterBar({
  searchKeyword,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  statusFilter,
  onStatusChange,
  onReset,
}: {
  searchKeyword: string;
  onSearchChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="상품명 검색"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
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
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">전체 승인상태</option>
          <option value="REQUESTED">대기중</option>
          <option value="RETURN_PENDING">대여</option>
          <option value="APPROVED">승인</option>
          <option value="REJECTED">거절</option>
        </select>
        <button
          onClick={onReset}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          초기화
        </button>
      </div>
    </div>
  );
}

// 페이지네이션 컴포넌트
function Pagination({
  currentPage,
  totalPages,
  totalCount,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-t">
      <div className="text-sm text-gray-500">총 {totalCount}개 항목</div>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 0}
          onClick={() => onChange(0)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          First
        </button>
        <button
          disabled={currentPage === 0}
          onClick={() => onChange(currentPage - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2">
          Page {currentPage + 1} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onChange(currentPage + 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onChange(totalPages - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Last
        </button>
      </div>
    </div>
  );
}
