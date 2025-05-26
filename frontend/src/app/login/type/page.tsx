"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginUser } from "@/stores/auth/loginMember";

export default function LoginTypePage() {
  const router = useRouter();
  const handleGoToHome = () => {
    router.push("/");
  };
  const handleTypeSelect = (type: "MANAGER" | "ADMIN") => {
    router.push(`/login?type=${type}`); // 로그인 유형을 쿼리 파라미터로 전달
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center overflow-hidden">
      <div className="flex gap-x-24 max-w-[1400px] mx-auto">
        <div className="w-1/3 flex-shrink-0 flex flex-col justify-center">
          <div className="pl-0">
            <Link href="/">
              <p className="text-slate-600 mb-8 max-w-xl"></p>
              <img
                src="/logo.png"
                alt="Juseyo 로고"
                className="h-10 mb-8 rounded-xl shadow-md"
              />
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">
              로그인
            </h1>
            <p className="text-lg mb-2 text-gray-600">
              재고 관리 플랫폼 Juseyo에 오신 것을 환영합니다.
            </p>
            <p className="text-base text-gray-500 mb-6">
              계정에 로그인하여 재고를 효율적으로 관리하세요.
            </p>
          </div>
        </div>
        <div className="w-2/3 flex items-center">
          <div className="shadow-xl rounded-2xl overflow-hidden w-[800px]">
            <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
              <h2 className="text-2xl font-bold">로그인 유형 선택</h2>
              <p className="text-base mt-2 opacity-80">
                어떤 계정으로 로그인하시겠습니까?
              </p>
            </div>

            <div className="bg-white p-8 grid grid-cols-2 gap-6">
              <button
                className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
                onClick={() => handleTypeSelect("MANAGER")}
              >
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#0047AB]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0047AB] mb-2">
                  매니저 로그인
                </h2>
                <p className="text-base text-gray-500 text-center whitespace-nowrap">
                  재고 및 사용자 관리를 위한 접근
                </p>
                <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </button>

              <button
                className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
                onClick={() => handleTypeSelect("ADMIN")}
              >
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#0047AB]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0047AB] mb-2">
                  일반 회원 로그인
                </h2>
                <p className="text-base text-gray-500 text-center whitespace-nowrap">
                  재고 조회 및 요청을 위한 접근
                </p>
                <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <div className="bg-gray-50 px-8 py-4 text-center">
              <div className="flex justify-center space-x-6">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base mr-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  홈으로 돌아가기
                </Link>
                <button
                  onClick={() => router.push("/signup")}
                  className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  회원가입 하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
