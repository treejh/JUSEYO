"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginMember";
import { Header } from "./components/Header";
import { useNotificationStore } from "@/stores/notifications";
import { NotificationBell } from "@/components/Notification/NotificationBell";
import LoadingScreen from "./components/LoadingScreen";
import { Navigation } from "@/components/Navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();
  // 로그인, 회원가입, 루트 페이지에서는 네비게이션을 표시하지 않음
  const isAuthPage = pathname === "/login" || pathname === "/signup";
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
    setSidebarCollapsed(prev => !prev);
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
    // 사용자 정보 가져오기
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/token`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const userData = data.data;
        console.log("사용자 데이터:", userData);

        if (!userData || !userData.id) {
          console.error("사용자 ID가 없습니다:", userData);
          setNoLoginUser();
          return;
        }

        setLoginUser({
          id: userData.id,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          username: userData.name,
          managementDashboardName: userData.managementDashboardName ?? "",
          departmentName: userData.departmentName ?? "",
          role: userData.role ?? "user", // Provide a default role if not present
        });

        // SSE 연결
        const connectSSE = async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/stream`,
              {
                credentials: "include",
              }
            );

            if (!response.ok) {
              throw new Error(`SSE 연결 실패: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error("SSE 스트림을 읽을 수 없습니다.");
            }

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.trim() === "") continue;

                if (line.startsWith("data:")) {
                  const data = line.slice(5).trim();
                  try {
                    const parsed = JSON.parse(data);
                    console.log(
                      `🔔 [${parsed.type || "message"}] 알림 수신:`,
                      parsed
                    );

                    // 알림 스토어에 추가
                    useNotificationStore.getState().addNotification({
                      id: Number(parsed.id),
                      message: parsed.message,
                      type: parsed.type,
                      createdAt: parsed.createdAt,
                      read: false,
                    });
                  } catch (e) {
                    console.log(`💬 [message] 텍스트 메시지: ${data}`);
                  }
                }
              }
            }
          } catch (error) {
            console.error("SSE 연결 오류:", error);
            // 3초 후 재연결 시도
            setTimeout(connectSSE, 3000);
          }
        };

        connectSSE();
      })
      .catch((error) => {
        console.error("사용자 정보 조회 실패:", error);
        setNoLoginUser();
      });
  }, [setLoginUser, setNoLoginUser]);

  if (isLoginUserPending) {
    return <LoadingScreen message="로그인 정보를 불러오는 중입니다..." />;
  }

  return (
    <LoginUserContext.Provider value={LoginUserContextValue}>
      <div className={`flex flex-col ${isAuthPage ? 'h-screen w-screen' : 'min-h-screen'} bg-white ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {!isAuthPage && <Header onToggleSidebar={toggleSidebar} />}
        <div className="fixed top-4 right-4 z-50">
          <NotificationBell />
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex flex-1">
            {!shouldHideNav && (
              <Navigation
                userRole={loginUser?.role === 'MANAGER' || loginUser?.role === 'ADMIN' ? 'manager' : 'user'}
                isSidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={toggleSidebar}
              />
            )}
            <main
              className={`flex-1 ${!isAuthPage ? 'pt-[60px]' : ''} 
              ${!shouldHideNav ? (sidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]') : ''} 
              bg-[#F4F4F4] transition-all duration-300`}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </LoginUserContext.Provider>
  );
}