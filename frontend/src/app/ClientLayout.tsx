"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginMember";
import { Header } from "./components/Header";
import { useNotificationStore } from "@/stores/notifications";
import { NotificationBell } from "@/components/Notification/NotificationBell";
import LoadingScreen from "./components/LoadingScreen";
import Navigation from "@/components/Navigation/Navigation";
import { useCustomToast } from "@/utils/toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const alertedRef = useRef(false);
  const requestedAlertedRef = useRef(false);
  const loggedInAuthPageAlertedRef = useRef(false);
  const loginRequiredAlertedRef = useRef(false);

  const isLoginPage = pathname.startsWith("/login");
  const isSignupPage = pathname.startsWith("/signup");
  const isFindPage = pathname.startsWith("/find");
  const isAdminRequestPage = pathname === "/admin/request";
  const isTermsPage = pathname === "/terms";
  const isPrivacyPage = pathname === "/privacy";
  const isSupportPage = pathname === "/support";

  // 로그인, 회원가입, 루트 페이지, 이용약관, 개인정보 처리방침, 고객지원 페이지에서는 네비게이션을 표시하지 않음
  const isAuthPage =
    isLoginPage || isSignupPage || isFindPage || isAdminRequestPage;
  const isRootPage = pathname === "/";
  const isSimplePage = isTermsPage || isPrivacyPage || isSupportPage;
  const shouldHideNav = isAuthPage || isRootPage || isSimplePage;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toast = useCustomToast();

  const {
    loginUser,
    setLoginUser,
    isLoginUserPending,
    setNoLoginUser,
    isLogin,
    logout,
    logoutAndHome,
    removeLoginUser,
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

    // 인증/비회원 페이지에서는 fetchUserData 실행하지 않음
    if (isLoginPage || isSignupPage || isFindPage) {
      removeLoginUser(); // 로그인 정보 초기화(필요시)
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
            removeLoginUser();
            return;
          }

          toast.error("로그인이 필요합니다.");
          router.push("/login/type");
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
          approvalStatus: userData.approvalStatus ?? "",
        });

        // SSE 연결
        const connectSSE = async () => {
          try {
            const response = await fetch(
              `${API_URL}/api/v1/notifications/stream`,
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
                      notificationType: parsed.notificationType,
                      createdAt: parsed.createdAt,
                      readStatus: false,
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

        if (
          userData.approvalStatus !== "REQUESTED" &&
          userData.approvalStatus !== "REJECTED"
        ) {
          connectSSE();
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        setNoLoginUser();
      }
    };

    fetchUserData();
  }, [isLogin, isLoginPage, isSignupPage, isFindPage, isAdminRequestPage]);

  // 로그인되지 않은 사용자가 접근 시 리다이렉트

  useEffect(() => {
    if (isLoginUserPending) return;

    // 요청 상태 유저 알림 + 리다이렉트 (우선 처리)
    if (
      isLogin &&
      loginUser?.approvalStatus === "REQUESTED" &&
      !isAuthPage &&
      pathname !== "/user" &&
      pathname !== "/"
    ) {
      if (!requestedAlertedRef.current) {
        toast.error("요청 상태중인 유저 입니다");
        requestedAlertedRef.current = true;
      }
      router.replace("/");
      return;
    }

    // 요청 상태 유저 알림 + 리다이렉트 (우선 처리)
    if (
      isLogin &&
      loginUser?.approvalStatus === "REJECTED" &&
      !isAuthPage &&
      pathname !== "/user" &&
      pathname !== "/"
    ) {
      if (!requestedAlertedRef.current) {
        toast.error("접근 거부된 유저입니다");
        requestedAlertedRef.current = true;
      }
      router.replace("/");
      return;
    }

    // 이미 로그인된 사용자가 인증 페이지 접근 시 알림 + 이동
    if (isLogin && isAuthPage) {
      if (!loggedInAuthPageAlertedRef.current) {
        toast.error("이미 로그인된 사용자 입니다.");
        loggedInAuthPageAlertedRef.current = true;
      }

      // 로그인된 사용자가 로그인/회원가입/찾기 페이지 접근 시 리다이렉트
      if (isLogin && (isLoginPage || isSignupPage || isFindPage)) {
        toast.error("이미 로그인된 사용자 입니다.");
        router.push("/");
        return;
      }

      // 비로그인 상태에서 인증이 필요한 페이지 접근 시 알림 + 이동
      if (!isLogin && !isAuthPage && !isRootPage) {
        if (!loginRequiredAlertedRef.current) {
          toast.error("로그인이 필요한 페이지입니다.");
          loginRequiredAlertedRef.current = true;
        }
        router.push("/login/type");
        return;
      }

      // 알림 리셋: 경로 바뀔 때마다 리셋해서 동일 경로 재접근 시 alert 다시 뜨도록
      requestedAlertedRef.current = false;
      loggedInAuthPageAlertedRef.current = false;
      loginRequiredAlertedRef.current = false;
    }
  }, [
    isLogin,
    isAuthPage,
    isRootPage,
    isLoginUserPending,
    router,
    loginUser,
    pathname,
  ]);

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
              className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
                !shouldHideNav
                  ? sidebarCollapsed
                    ? "ml-[80px]"
                    : "ml-[280px]"
                  : ""
              }`}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </LoginUserContext.Provider>
  );
}
