"use client";

import React from "react";
import {
  LoginUserContext,
  useLoginUser,
  useGlobalLoginUser,
} from "@/stores/auth/loginMember";

export default function Home() {
  const { loginUser, isLogin } = useGlobalLoginUser();

  return (
    <div className="bg-white text-black">
      <div className="p-4">
        {isLogin ? (
          <div>
            <h1 className="text-xl font-bold text-black">{loginUser.username}님 환영합니다!</h1>
            <p className="text-gray-700">이메일: {loginUser.email}</p>
            <p className="text-gray-700">전화번호: {loginUser.phoneNumber}</p>
            <p className="text-gray-700">대시보드 이름: {loginUser.managementDashboardName || "없음"}</p>
            <p className="text-gray-700">부서 이름: {loginUser.departmentName || "없음"}</p>
          </div>
        ) : (
          <p className="text-gray-700">로그인이 필요합니다.</p>
        )}
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4 text-black">JUSEYO</h1>
        <p className="text-lg mb-8 text-gray-700">프로젝트에 오신 것을 환영합니다!</p>
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600">
            기본 템플릿입니다. src/app/page.tsx 파일을 수정하여 시작하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
