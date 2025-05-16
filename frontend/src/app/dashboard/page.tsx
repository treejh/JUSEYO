"use client";

import React, { useEffect } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const router = useRouter();

  // 인증 확인 - 로그인하지 않은 사용자 리디렉션
  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    }
  }, [isLogin, router]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800">대시보드</h1>
          <p className="text-gray-600">
            {loginUser.username}님, 환영합니다!
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">대시보드 정보</h2>
          
          {loginUser.managementDashboardName ? (
            <div>
              <p className="mb-4">현재 관리 중인 대시보드: <span className="font-medium text-blue-700">{loginUser.managementDashboardName}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">재고 현황</h3>
                  <p className="text-gray-600">현재 대시보드의 재고 상태를 확인하세요.</p>
                  <button 
                    onClick={() => router.push("/dashboard/inventory")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    재고 관리
                  </button>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                  <h3 className="text-lg font-medium text-indigo-800 mb-2">부서 관리</h3>
                  <p className="text-gray-600">부서 및 구성원을 관리합니다.</p>
                  <button 
                    onClick={() => router.push("/dashboard/departments")}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    부서 관리
                  </button>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">통계 및 분석</h3>
                  <p className="text-gray-600">재고 데이터 분석 및 리포트를 확인하세요.</p>
                  <button 
                    onClick={() => router.push("/dashboard/analytics")}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    통계 보기
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 mb-4">아직 관리 중인 대시보드가 없습니다.</p>
              <button
                onClick={() => router.push("/dashboard/create")}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                대시보드 생성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 