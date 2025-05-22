"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginMember";
import { Header } from "./components/Header";
import { useNotificationStore } from "@/stores/notifications";
import { NotificationBell } from "@/components/Notification/NotificationBell";
import LoadingScreen from "./components/LoadingScreen";
import Navigation from "@/components/Navigation/Navigation";

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
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!API_URL) {
      console.error('API URL이 설정되지 않았습니다.');
      return;
    }

    console.log('API URL:', API_URL); // API URL 로깅

    // 사용자 정보 가져오기
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/token`, {
          method: 'GET',
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
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
          username: userData.name,
          managementDashboardName: userData.managementDashboardName ?? "",
          departmentName: userData.departmentName ?? "",
          role: userData.role ?? "user",
        });

        // SSE 연결 시도
        let retryCount = 0;
        const maxRetries = 3;

        const connectSSE = async () => {
          if (retryCount >= maxRetries) {
            console.error('SSE 연결 최대 재시도 횟수 초과');
            return;
          }

          try {
            console.log('SSE 연결 시도...'); // 연결 시도 로깅
            const eventSource = new EventSource(`${API_URL}/api/v1/notifications/stream`, {
              withCredentials: true
            });

            eventSource.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log(`🔔 [${data.type || "message"}] 알림 수신:`, data);

                useNotificationStore.getState().addNotification({
                  id: Number(data.id),
                  message: data.message,
                  type: data.type,
                  createdAt: data.createdAt,
                  read: false,
                });
              } catch (e) {
                console.log(`💬 [message] 텍스트 메시지:`, event.data);
              }
            };

            eventSource.onerror = (error) => {
              console.error('SSE 연결 오류:', error);
              eventSource.close();
              retryCount++;
              setTimeout(connectSSE, 3000);
            };

            return () => {
              console.log('SSE 연결 종료');
              eventSource.close();
            };
          } catch (error) {
            console.error('SSE 연결 실패:', error);
            retryCount++;
            setTimeout(connectSSE, 3000);
          }
        };

        connectSSE();
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        setNoLoginUser();
      }
    };

    fetchUserData();
  }, [setLoginUser, setNoLoginUser]);

  if (isLoginUserPending) {
    return <LoadingScreen message="로그인 정보를 불러오는 중입니다..." />;
  }

  return (
    <LoginUserContext.Provider value={LoginUserContextValue}>
      <div className={`flex flex-col ${isAuthPage ? "h-screen w-screen" : "min-h-screen"} bg-white`}>
        {!isAuthPage && <Header />}
        <main className={`flex-1 ${!isAuthPage ? "pt-[60px]" : ""} bg-[#F4F4F4]`}>
          <div className="flex">
            {/* 네비게이션 사이드바 */}
            {!shouldHideNav && (
              <div className={`juseyo-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Navigation 
                  userRole={loginUser?.role?.replace('ROLE_', '') as 'ADMIN' | 'MANAGER' | 'USER'}
                  isSidebarCollapsed={sidebarCollapsed}
                  onToggleSidebar={toggleSidebar}
                />
              </div>
            )}
            
            {/* 메인 콘텐츠 */}
            <div className={`flex-1 ${!shouldHideNav ? (sidebarCollapsed ? 'ml-[80px]' : 'ml-[280px]') : ''} transition-all duration-300`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </LoginUserContext.Provider>
  );
}