"use client";

import { useEffect } from "react";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginMember";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const {
    loginUser,
    setLoginUser,
    isLoginUserPending,
    setNoLoginUser,
    isLogin,
    logout,
    logoutAndHome,
  } = useLoginUser();

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
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/token`, {
      credentials: "include", // 쿠키를 포함하도록 설정
    })
      .then((response) => response.json())
      .then((data) => {
        // 디버깅을 위한 로그 추가
        console.log("서버 응답 데이터:", data);

        // 서버로부터 받은 데이터 처리
        const userData = data.data;
        console.log("사용자 데이터:", userData);

        if (!userData || !userData.userId) {
          console.error("사용자 ID가 없습니다:", userData);
          setNoLoginUser();
          return;
        }

        // User 인터페이스와 맞게 변환
        setLoginUser({
          id: userData.userId,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          username: userData.name,
          managementDashboardName: userData.managementDashboardName ?? "",
          departmentName: userData.departmentName ?? "",
        });

        // SSE 연결 설정
        const eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/stream/${userData.userId}`
        );

        eventSource.onmessage = (event) => {
          const notification = JSON.parse(event.data);
          console.log("새로운 알림:", notification);
          // 여기에 알림을 표시하는 로직을 추가할 수 있습니다
        };

        eventSource.onerror = (error) => {
          console.error("SSE 연결 오류:", error);
          eventSource.close();
        };

        // 컴포넌트 언마운트 시 SSE 연결 종료
        return () => {
          eventSource.close();
        };
      })
      .catch((error) => {
        setNoLoginUser();
      });
  }, []);

  if (isLoginUserPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>로딩중</div>
      </div>
    );
  }

  return (
    <LoginUserContext.Provider value={LoginUserContextValue}>
      <main className="bg-[#F4F4F4] min-h-screen">{children}</main>
    </LoginUserContext.Provider>
  );
}
