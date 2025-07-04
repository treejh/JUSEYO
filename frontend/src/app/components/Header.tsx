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
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="flex items-center justify-between px-4 h-[60px]">
        <div className="flex items-center">
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
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <Link
                  href="/user"
                  className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-800 text-sm font-medium shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                    />
                  </svg>
                  <span>{loginUser?.name || "유저"}</span>
                </Link>
                <button
                  onClick={logoutAndHome}
                  className="bg-white border border-blue-500 text-blue-500 px-4 py-1.5 rounded-md text-sm hover:bg-blue-50"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login/type"
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
