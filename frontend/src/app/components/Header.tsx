"use client";

import Link from "next/link";
import Image from "next/image";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

export function Header() {
  const { loginUser, isLogin, logoutAndHome } = useGlobalLoginUser();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 h-[60px]">
        <Link href="/" className="flex items-center">
          <div className="w-[120px] relative">
            <Image
              src="/logo.png"
              alt="Juseyo 로고"
              width={120}
              height={40}
              className="object-contain rounded-md"
            />
          </div>
        </Link>
        
        <div className="flex items-center">
          {isLogin ? (
            <>
              <Link href="/" className="text-gray-700 hover:text-blue-500 mx-3">
                홈
              </Link>
              <button
                onClick={logoutAndHome}
                className="bg-white border border-blue-500 text-blue-500 px-4 py-1.5 rounded-md text-sm hover:bg-blue-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 mx-3 text-sm border border-gray-300 px-4 py-1.5 rounded-md hover:bg-gray-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="bg-[#0047AB] text-white px-4 py-1.5 rounded-md text-sm"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 