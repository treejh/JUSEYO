// src/app/item/supplyrequest/edit/[id]/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

interface SupplyRequest {
  id: number;
  itemId: number;
  productName: string;
  quantity: number;
  purpose: string;
  useDate: string | null;
  returnDate: string | null;
  rental: boolean;
  approvalStatus: string;
}

export default function SupplyRequestEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isLogin } = useGlobalLoginUser();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const [request, setRequest] = useState<SupplyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [useDate, setUseDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // redirect if not logged in
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  // load my requests and pick this one
  useEffect(() => {
    async function fetchRequest() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/supply-requests/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const req: SupplyRequest = await res.json();
        setRequest(req);

        // initialize form
        setQuantity(req.quantity);
        setPurpose(req.purpose);
        if (req.useDate) setUseDate(req.useDate.slice(0, 10));
        if (req.returnDate) setReturnDate(req.returnDate.slice(0, 10));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
  }, [API_BASE, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!request) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        quantity,
        purpose,
        rental: request.rental,
        useDate: `${useDate}T00:00:00`,
        returnDate: request.rental ? `${returnDate}T00:00:00` : null,
      };
      const res = await fetch(
        `${API_BASE}/api/v1/supply-requests/${request.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      router.push("/item/supplyrequest/list/user");
    } catch (e: any) {
      setError(`수정 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4">요청 정보를 불러오는 중...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          뒤로가기
        </button>
      </div>
    );
  }
  if (!request) return null;

  return (
    <main className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm">
        {/* 헤더 섹션 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">비품 요청 수정</h1>
              <p className="mt-1 text-sm text-gray-500">
                비품 요청 내용을 수정할 수 있습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/item/supplyrequest/list/user")}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              목록으로
            </button>
          </div>
        </div>

        {/* 폼 섹션 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* 상품명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명
              </label>
              <input
                disabled
                value={request.productName}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
              />
            </div>

            {/* 수량 / 대여 여부 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수량
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(+e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대여 여부
                </label>
                <div className="flex gap-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${request.rental ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                    {request.rental ? "대여" : "미대여"}
                  </span>
                </div>
              </div>
            </div>

            {/* 날짜 선택 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 일자
                </label>
                <input
                  type="date"
                  value={useDate}
                  onChange={(e) => setUseDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {request.rental && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반납 일자
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* 요청 사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청 사유
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="요청 사유를 입력해주세요"
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-3 bg-[#0047AB] hover:bg-[#003d91] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] disabled:opacity-50"
            >
              {saving ? "수정 중..." : "수정하기"}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
