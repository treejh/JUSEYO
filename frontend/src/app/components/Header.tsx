"use client";

import Link from "next/link";
import Image from "next/image";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { NotificationBell } from "@/components/Notification/NotificationBell";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { loginUser, isLogin, logoutAndHome } = useGlobalLoginUser();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 h-[60px]">
        <div className="flex items-center">
          {isLogin && (
            <button 
              onClick={onToggleSidebar}
              className="mr-4 p-1 rounded hover:bg-gray-100"
              aria-label="사이드바 토글"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}
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
        </div>
        <div className="flex items-center">
          {isLogin ? (
            <>
              <div className="mr-3">
                <NotificationBell />
              </div>
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
