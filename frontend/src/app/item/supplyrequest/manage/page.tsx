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
    <main className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-full lg:max-w-7xl bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            대시보드: 비품 요청 승인/거절
          </h1>
          <Link
            href="/item/supplyrequest"
            className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
          >
            내 요청서 보기
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-3 py-2 border">ID</th>
                  <th className="px-3 py-2 border">상품명</th>
                  <th className="px-3 py-2 border">수량</th>
                  <th className="px-3 py-2 border">사유</th>
                  <th className="px-3 py-2 border">사용일</th>
                  <th className="px-3 py-2 border">반납일</th>
                  <th className="px-3 py-2 border">대여여부</th>
                  <th className="px-3 py-2 border">작성일</th>
                  <th className="px-3 py-2 border">액션</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border hover:bg-gray-50">
                    <td className="px-3 py-2 border">{req.id}</td>
                    <td className="px-3 py-2 border">{req.productName}</td>
                    <td className="px-3 py-2 border">{req.quantity}</td>
                    <td className="px-3 py-2 border">{req.purpose}</td>
                    <td className="px-3 py-2 border">{req.useDate ?? "-"}</td>
                    <td className="px-3 py-2 border">
                      {req.returnDate ?? "-"}
                    </td>
                    <td className="px-3 py-2 border">
                      {req.rental ? "대여" : "지급"}
                    </td>
                    <td className="px-3 py-2 border">{req.createdAt}</td>
                    <td className="px-3 py-2 border space-x-2">
                      <button
                        onClick={() => updateStatus(req.id, "approve")}
                        disabled={processingIds.includes(req.id)}
                        className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, "reject")}
                        disabled={processingIds.includes(req.id)}
                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        거절
                      </button>
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
