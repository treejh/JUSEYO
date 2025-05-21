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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function SupplyRequestListPage() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const isManager = isLogin && loginUser?.role === "MANAGER";
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-full lg:max-w-7xl bg-white shadow-lg rounded-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">내 비품 요청서 목록</h1>
          <div className="flex gap-2">
            <Link
              href="/item/supplyrequest/create"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              새 요청서 작성
            </Link>
            {isManager && (
              <Link
                href="/item/supplyrequest/manage"
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                요청 승인/거절
              </Link>
            )}
          </div>
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
                  <th className="px-3 py-2 border">승인상태</th>
                  <th className="px-3 py-2 border">작성일</th>
                  <th className="px-3 py-2 border">수정</th>
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
                    <td className="px-3 py-2 border">{req.approvalStatus}</td>
                    <td className="px-3 py-2 border">{req.createdAt}</td>
                    <td className="px-3 py-2 border">
                      {req.approvalStatus === "REQUESTED" ? (
                        <Link
                          href={`/item/supplyrequest/update/${req.id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          수정
                        </Link>
                      ) : (
                        "-"
                      )}
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
