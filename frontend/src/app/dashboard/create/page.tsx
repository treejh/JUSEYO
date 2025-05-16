"use client";

import React, { useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useRouter } from "next/navigation";

export default function CreateDashboard() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const router = useRouter();
  const [dashboardName, setDashboardName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 대시보드 생성 처리
  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dashboardName.trim()) {
      setError("대시보드 이름을 입력해주세요.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      // API 호출 예시 - 실제 구현은 백엔드에 맞게 수정 필요
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: dashboardName,
            description: description,
          }),
        }
      );

      if (response.ok) {
        // 성공 시 대시보드 페이지로 이동
        alert("대시보드가 성공적으로 생성되었습니다!");
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "대시보드 생성 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("서버 연결 중 오류가 발생했습니다. 나중에 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-6">새 대시보드 생성</h1>
        
        <form onSubmit={handleCreateDashboard} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="dashboardName" className="block text-sm font-medium text-gray-700 mb-1">
              대시보드 이름
            </label>
            <input
              type="text"
              id="dashboardName"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 물류센터 재고관리"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              대시보드 설명 (선택사항)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
              placeholder="대시보드의 용도와 목적을 설명해주세요."
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "처리 중..." : "대시보드 생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 