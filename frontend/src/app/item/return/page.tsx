"use client";

import React, { useState, useEffect } from "react";
import { useCustomToast } from "@/utils/toast";
import Link from "next/link";

interface SupplyReturn {
  id: number;
  requestId: number | null;
  userId: number;
  userName?: string;
  serialNumber: string | null;
  productName: string;
  quantity: number;
  useDate: string;
  returnDate: string | null;
  approvalStatus: string;
  outbound: "AVAILABLE" | "DAMAGED";
}

interface PageResponse {
  content: SupplyReturn[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function ReturnPage() {
  const [returns, setReturns] = useState<SupplyReturn[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<SupplyReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedOutbound, setSelectedOutbound] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const toast = useCustomToast();

  const fetchReturns = async (page: number = 1, status: string = "") => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: "10",
      });

      if (status) {
        queryParams.append("approvalStatus", status);
      }

      const res = await fetch(
        `${API_BASE}/api/v1/supply-return?${queryParams.toString()}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("반납 목록을 불러오는데 실패했습니다.");

      const data: PageResponse = await res.json();
      setReturns(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...returns];

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(keyword) ||
          item.serialNumber?.toLowerCase().includes(keyword) ||
          item.userName?.toLowerCase().includes(keyword) ||
          item.requestId?.toString().includes(keyword)
      );
    }

    if (selectedOutbound) {
      filtered = filtered.filter(
        (item) => item.outbound === selectedOutbound
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(
        (item) => item.approvalStatus === selectedStatus
      );
    }

    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.returnDate || item.useDate);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;

        if (start && end) {
          end.setHours(23, 59, 59);
          return itemDate >= start && itemDate <= end;
        } else if (start) {
          return itemDate >= start;
        } else if (end) {
          end.setHours(23, 59, 59);
          return itemDate <= end;
        }
        return true;
      });
    }

    setFilteredReturns(filtered);
    setCurrentPage(1);
  }, [returns, searchKeyword, selectedOutbound, selectedStatus, dateRange.start, dateRange.end]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchReturns(1, selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleOutboundChange = (outbound: string) => {
    setSelectedOutbound(outbound);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    // 검색어가 변경되면 자동으로 필터링됨
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  const handleReset = () => {
    setSearchKeyword("");
    setDateRange({ start: "", end: "" });
    setSelectedStatus("");
    setSelectedOutbound("");
    fetchReturns(1, "");
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "RETURN_PENDING":
        return "bg-yellow-50 text-yellow-600";
      case "RETURNED":
        return "bg-green-50 text-green-600";
      case "RETURN_REJECTED":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "RETURN_PENDING":
        return "반납 대기 중";
      case "RETURNED":
        return "반납 완료";
      case "RETURN_REJECTED":
        return "반납 거절";
      default:
        return status;
    }
  };

  const getOutboundBadgeStyle = (outbound: string) => {
    switch (outbound) {
      case "AVAILABLE":
        return "bg-blue-50 text-blue-600";
      case "DAMAGED":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getOutboundText = (outbound: string) => {
    switch (outbound) {
      case "AVAILABLE":
        return "사용 가능";
      case "DAMAGED":
        return "파손";
      default:
        return outbound;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 반납 요청을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-return/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
      toast.success("삭제가 완료되었습니다.");
      fetchReturns(currentPage, selectedStatus);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                비품 반납 내역
              </h1>
              <p className="text-gray-600">
                비품 반납 현황을 조회할 수 있습니다.
              </p>
            </div>
            <Link
              href="/item/return/manage"
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
              반납 관리
            </Link>
          </div>

          {/* 통계 섹션 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">전체 반납</p>
              <p className="text-2xl font-bold text-blue-900">
                {returns.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">반납 대기</p>
              <p className="text-2xl font-bold text-yellow-900">
                {
                  returns.filter(
                    (item) => item.approvalStatus === "RETURN_PENDING"
                  ).length
                }
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">반납 완료</p>
              <p className="text-2xl font-bold text-green-900">
                {
                  returns.filter((item) => item.approvalStatus === "RETURNED")
                    .length
                }
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">반납 거절</p>
              <p className="text-2xl font-bold text-red-900">
                {
                  returns.filter((item) => item.approvalStatus === "REJECTED")
                    .length
                }
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600">파손</p>
              <p className="text-2xl font-bold text-orange-900">
                {returns.filter((item) => item.outbound === "DAMAGED").length}
              </p>
            </div>
          </div>

          {/* 검색 / 필터 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="상품명, 요청자 이름 또는 요청서ID로 검색"
                      value={searchKeyword}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
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
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">전체</option>
                    <option value="RETURN_PENDING">반납 대기 중</option>
                    <option value="RETURNED">반납 완료</option>
                    <option value="RETURN_REJECTED">반납 거절</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 상태
                  </label>
                  <select
                    value={selectedOutbound}
                    onChange={(e) => handleOutboundChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    <option value="">전체</option>
                    <option value="AVAILABLE">사용 가능</option>
                    <option value="DAMAGED">파손</option>
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
                      value={dateRange.start}
                      onChange={(e) =>
                        handleDateChange("start", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
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

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청서ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청자명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고유번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    반납일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    반납 상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재 상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
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
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <p className="text-gray-500">반납 내역이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.requestId || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.userName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.serialNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.useDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.returnDate
                          ? new Date(item.returnDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(
                            item.approvalStatus
                          )}`}
                        >
                          {getStatusText(item.approvalStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutboundBadgeStyle(
                            item.outbound
                          )}`}
                        >
                          {getOutboundText(item.outbound)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {item.approvalStatus === "RETURN_PENDING" && (
                          <>
                            <a
                              href={`/item/supplyeturn/edit/${item.id}`}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                            >
                              수정
                            </a>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              삭제
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
        {!loading && filteredReturns.length > 0 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="px-6 py-2 text-gray-700">
                페이지 {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
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
