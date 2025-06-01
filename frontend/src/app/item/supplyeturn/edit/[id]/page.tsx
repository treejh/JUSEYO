"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

interface SupplyReturn {
  id: number;
  requestId: number | null;
  userId: number;
  productName: string;
  quantity: number;
  useDate: string;
  returnDate: string | null;
  approvalStatus: string;
  outbound: "AVAILABLE" | "DAMAGED";
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function EditReturnPage() {
  const router = useRouter();
  const params = useParams();
  const { loginUser } = useGlobalLoginUser();
  const toast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<SupplyReturn | null>(null);
  const [form, setForm] = useState({ quantity: 1, outbound: "AVAILABLE" });

  // 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/supply-return/${params.id}`, { credentials: "include" });
        if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
        const result = await res.json();
        setData(result);
        setForm({ quantity: result.quantity, outbound: result.outbound });
      } catch (e: any) {
        setErrorMsg(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  // 수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || data.approvalStatus !== "RETURN_PENDING") {
      toast.error("반납 대기 중 상태에서만 수정할 수 있습니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-return/${data.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("수정에 실패했습니다.");
      toast.success("수정이 완료되었습니다.");
      router.push("/item/supplyeturn");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[200px]">
      <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
  if (errorMsg) return <div className="text-red-500 text-center py-10">{errorMsg}</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6">반납 요청 수정</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상품명</label>
            <div className="p-2 bg-gray-100 rounded">{data.productName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">반납 수량</label>
            <input
              type="number"
              min={1}
              max={data.quantity}
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
              required
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">현재 상태</label>
            <select
              value={form.outbound}
              onChange={e => setForm(f => ({ ...f, outbound: e.target.value as "AVAILABLE" | "DAMAGED" }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
              disabled={data.approvalStatus !== "RETURN_PENDING"}
            >
              <option value="AVAILABLE">사용 가능</option>
              <option value="DAMAGED">파손</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/item/supplyeturn")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#0047AB] text-white hover:bg-[#003380] disabled:opacity-50"
              disabled={loading || data.approvalStatus !== "RETURN_PENDING"}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 