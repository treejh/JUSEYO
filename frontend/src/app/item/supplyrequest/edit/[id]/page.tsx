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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">비품 요청 수정</h1>
          <p className="mt-2 text-sm text-gray-600">
            비품 요청 내용을 수정할 수 있습니다.
          </p>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 상품명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상품명
              </label>
              <input
                disabled
                value={request.productName}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
              />
            </div>

            {/* 수량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수량
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 대여 여부 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대여 여부
              </label>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  request.rental
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {request.rental ? "대여" : "미대여"}
              </div>
            </div>

            {/* 날짜 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 일자
                </label>
                <input
                  type="date"
                  value={useDate}
                  onChange={(e) => setUseDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                placeholder="요청 사유를 입력해주세요"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 버튼 그룹 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                    저장 중...
                  </div>
                ) : (
                  "수정 완료"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
