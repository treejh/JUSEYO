"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface OutboundItem {
  id: number;
  supplyRequestId: number;
  itemId: number;
  categoryId: number;
  managementId: number;
  quantity: number;
  outbound: string;
  createdAt: string;
  modifiedAt: string;
  categoryName: string;
  itemName: string;
}

interface OutboundResponse {
  content: OutboundItem[];
  totalPages: number;
  totalElements: number;
}

export default function OutboundPage() {
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOutboundType, setSelectedOutboundType] = useState("");
  const [outboundData, setOutboundData] = useState<OutboundResponse | null>(
    null
  );
  const [filteredContent, setFilteredContent] = useState<OutboundItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // unique categories
  const categories = useMemo(() => {
    if (!outboundData?.content) return [];
    const setCat = new Set(outboundData.content.map((i) => i.categoryName));
    return Array.from(setCat);
  }, [outboundData]);

  const outboundTypes = [
    { value: "", label: "전체" },
    { value: "ISSUE", label: "지급" },
    { value: "LOST", label: "분실" },
    { value: "LEND", label: "대여" },
    { value: "REPAIR", label: "수리" },
    { value: "DISPOSAL", label: "폐기" },
    { value: "DAMAGED", label: "파손" },
  ];

  // fetch api
  const fetchOutboundData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(pageSize),
        fromDate: dateRange.start,
        toDate: dateRange.end,
        search: searchKeyword,
      });

      const res = await fetch(`${baseUrl}/api/v1/inventory-out?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("데이터 로드 실패:" + res.status);

      const data = await res.json();
      setOutboundData(data);
    } catch (e) {
      setError("출고내역을 불러오는데 실패했습니다.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // apply front filters
  useEffect(() => {
    if (!outboundData) return;
    let list = [...outboundData.content];
    if (selectedCategory) {
      list = list.filter((i) => i.categoryName === selectedCategory);
    }
    if (selectedOutboundType) {
      list = list.filter((i) => i.outbound === selectedOutboundType);
    }
    setFilteredContent(list);
  }, [outboundData, selectedCategory, selectedOutboundType]);

  // initial & paging & filter trigger
  useEffect(() => {
    fetchOutboundData();
  }, [currentPage, dateRange, searchKeyword]);

  const formatDate = (d: string) => {
    try {
      return format(new Date(d), "yyyy-MM-dd", { locale: ko });
    } catch {
      return d;
    }
  };

  const downloadExcel = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(
        `${baseUrl}/api/v1/inventory-out/export?fromDate=${dateRange.start}&toDate=${dateRange.end}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `출고내역_${dateRange.start}_to_${dateRange.end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError("엑셀 다운로드 실패");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">출고내역</h1>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((r) => ({ ...r, start: e.target.value }))
          }
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={selectedOutboundType}
          onChange={(e) => setSelectedOutboundType(e.target.value)}
        >
          {outboundTypes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="검색어"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <button onClick={() => fetchOutboundData()}>조회</button>
        <button onClick={downloadExcel}>엑셀다운</button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {isLoading ? (
        <div>로딩중...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>출고ID</th>
              <th>요청서ID</th>
              <th>일자</th>
              <th>카테고리</th>
              <th>품목</th>
              <th>수량</th>
              <th>유형</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((it) => (
              <tr key={it.id}>
                <td>{it.id}</td>
                <td>{it.supplyRequestId}</td>
                <td>{formatDate(it.createdAt)}</td>
                <td>{it.categoryName}</td>
                <td>{it.itemName}</td>
                <td>{it.quantity}</td>
                <td>{it.outbound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* pagination */}
      <div className="mt-4 flex gap-2">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          이전
        </button>
        <span>
          {currentPage + 1} / {outboundData?.totalPages || 1}
        </span>
        <button
          disabled={currentPage >= (outboundData?.totalPages || 1) - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}
