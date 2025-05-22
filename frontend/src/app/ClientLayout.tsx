"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginMember";
import { Header } from "./components/Header";
import { useNotificationStore } from "@/stores/notifications";
import { NotificationBell } from "@/components/Notification/NotificationBell";
import LoadingScreen from "./components/LoadingScreen";
import Navigation from "@/components/Navigation/Navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 로그인, 회원가입, 루트 페이지에서는 네비게이션을 표시하지 않음
  const isAuthPage =
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/find/");
  const isRootPage = pathname === "/";
  const shouldHideNav = isAuthPage || isRootPage;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    loginUser,
    setLoginUser,
    isLoginUserPending,
    setNoLoginUser,
    isLogin,
    logout,
    logoutAndHome,
  } = useLoginUser();

  // 사이드바 접기/펼치기 토글 함수
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const LoginUserContextValue = {
    loginUser,
    setLoginUser,
    isLoginUserPending,
    setNoLoginUser,
    isLogin,
    logout,
    logoutAndHome,
  };

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_URL) {
      console.error("API URL이 설정되지 않았습니다.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/token`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setNoLoginUser();
            return;
          }
          throw new Error(`사용자 정보 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.data || !data.data.id) {
          console.error("사용자 데이터 형식 오류:", data);
          setNoLoginUser();
          return;
        }

        const userData = data.data;
        console.log("사용자 데이터:", userData);

        setLoginUser({
          id: userData.id,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          name: userData.name,
          managementDashboardName: userData.managementDashboardName ?? "",
          departmentName: userData.departmentName ?? "",
          role: userData.role ?? "user",
        });
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        setNoLoginUser();
      }
    };

    fetchUserData();
  }, [isLogin]); // 의존성 배열에서 setLoginUser와 setNoLoginUser 제거

  if (isLoginUserPending) {
    return <LoadingScreen message="로그인 정보를 불러오는 중입니다..." />;
  }

  return (
    <LoginUserContext.Provider value={LoginUserContextValue}>
      <div
        className={`flex flex-col ${
          isAuthPage ? "h-screen w-screen" : "min-h-screen"
        } bg-white`}
      >
        {!isAuthPage && <Header />}
        <main
          className={`flex-1 ${!isAuthPage ? "pt-[60px]" : ""} bg-[#F4F4F4]`}
        >
          <div className="flex">
            {/* 네비게이션 사이드바 */}
            {!shouldHideNav && (
              <div
                className={`juseyo-sidebar ${
                  sidebarCollapsed ? "sidebar-collapsed" : ""
                }`}
              >
                <Navigation
                  userRole={
                    loginUser?.role?.replace("ROLE_", "") as
                      | "ADMIN"
                      | "MANAGER"
                      | "USER"
                  }
                  isSidebarCollapsed={sidebarCollapsed}
                  onToggleSidebar={toggleSidebar}
                />
              </div>
            )}

            {/* 메인 콘텐츠 */}
            <div
              className={`flex-1 ${
                !shouldHideNav
                  ? sidebarCollapsed
                    ? "ml-[80px]"
                    : "ml-[280px]"
                  : ""
              } transition-all duration-300`}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </LoginUserContext.Provider>
  );
}
