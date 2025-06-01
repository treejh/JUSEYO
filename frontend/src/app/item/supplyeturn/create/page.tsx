"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

interface SupplyRequest {
  id: number;
  userId: number;
  itemId: number;
  serialNumber: string;
  productName: string;
  quantity: number;
  useDate: string;
  createdAt: string;
  approvalStatus?: string;
}

interface SupplyReturnRequest {
  requestId: number;
  userId: number;
  itemId: number;
  serialNumber?: string;
  productName: string;
  quantity: number;
  maxQuantity?: number;
  useDate: string;
  returnDate?: string;
  outbound?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function CreateReturnRequestPage() {
  const router = useRouter();
  const { loginUser } = useGlobalLoginUser();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);

  // 현재 시간 yyyy-MM-ddTHH:mm 포맷 (항상 한국시간)
  const getNowDateTimeKST = () => {
    const now = new Date();
    // UTC+9로 보정
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<SupplyReturnRequest>({
    requestId: 0,
    userId: loginUser?.id || 0,
    itemId: 1,
    serialNumber: "",
    productName: "",
    quantity: 1,
    maxQuantity: 1,
    useDate: "",
    returnDate: getNowDateTimeKST(),
    outbound: "AVAILABLE",
  });

  // 사용자의 비품 요청 목록 가져오기
  useEffect(() => {
    const fetchSupplyRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/supply-requests/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSupplyRequests(data || []);
      } catch (err: any) {
        setErrorMsg(`비품 요청 목록 로딩 실패: ${err.message}`);
      }
    };

    fetchSupplyRequests();
  }, []);

  // 선택한 비품 요청서의 상세 정보 가져오기
  const fetchSupplyRequestDetail = async (requestId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests/${requestId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        requestId: data.id,
        userId: data.userId,
        itemId: data.itemId,
        serialNumber: data.serialNumber,
        productName: data.productName,
        quantity: data.quantity,
        maxQuantity: data.quantity,
        useDate: data.useDate,
      }));
    } catch (err: any) {
      setErrorMsg(`비품 요청서 상세 정보 로딩 실패: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const submitData = {
        ...formData,
      };

      const res = await fetch(`${API_BASE}/api/v1/supply-return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      router.push("/item/supplyeturn");
    } catch (err: any) {
      setErrorMsg(`요청 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "requestId") {
      if (value) {
        fetchSupplyRequestDetail(Number(value));
      } else {
        setFormData(prev => ({
          ...prev,
          requestId: 0,
          itemId: 1,
          productName: "",
          quantity: 1,
          useDate: "",
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm">
        {/* 헤더 섹션 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 반납 요청</h1>
              <p className="mt-1 text-sm text-gray-500">
                반납할 비품의 정보를 입력해 주세요.
              </p>
            </div>
            <Link
              href="/item/supplyeturn"
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
            </Link>
          </div>
        </div>

        {/* 폼 섹션 */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {errorMsg && (
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
                    <p className="text-sm text-red-700">{errorMsg}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* 요청자 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요청자
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                  value={loginUser?.name}
                  disabled
                />
              </div>

              {/* 비품 요청서 선택 */}
              <div>
                <label
                  htmlFor="requestId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비품 요청서 선택
                </label>
                <select
                  id="requestId"
                  name="requestId"
                  required
                  value={formData.requestId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">요청서를 선택하세요</option>
                  {supplyRequests.filter(r => r.approvalStatus === "APPROVED").map((request) => (
                    <option key={request.id} value={request.id}>
                      [{request.id}] {request.productName} - {new Date(request.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* 품목명 */}
              <div>
                <label
                  htmlFor="productName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  품목명
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  required
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 반납 수량 */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  반납 수량 {!formData.maxQuantity && `(최대: ${formData.maxQuantity}개)`}
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  required
                  min="1"
                  max={formData.maxQuantity}
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.quantity > (formData.maxQuantity || 0) && (
                  <p className="mt-1 text-sm text-red-600">
                    반납 수량은 요청 수량({formData.maxQuantity}개)을 초과할 수 없습니다.
                  </p>
                )}
              </div>

              {/* 사용 일자 */}
              <div>
                <label
                  htmlFor="useDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  사용 일자
                </label>
                <input
                  type="datetime-local"
                  id="useDate"
                  name="useDate"
                  required
                  value={formData.useDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 반납 일자 */}
              <div>
                <label
                  htmlFor="returnDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  반납 일자
                </label>
                <input
                  type="datetime-local"
                  id="returnDate"
                  name="returnDate"
                  value={formData.returnDate || getNowDateTimeKST()}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 현재 상태 */}
              <div>
                <label
                  htmlFor="outbound"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  현재 상태
                </label>
                <select
                  id="outbound"
                  name="outbound"
                  value={formData.outbound}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AVAILABLE">사용 가능</option>
                  <option value="DAMAGED">파손</option>
                </select>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#0047AB] hover:bg-[#003d91] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] disabled:opacity-50"
              >
                {loading ? "처리 중..." : "요청하기"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
} 