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
        // 서버로부터 받은 데이터 처리
        const userData = data.data;

        // User 인터페이스와 맞게 변환
        setLoginUser({
          id: userData.id,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          username: userData.name, // ← 주의! username이 아니라 name
          managementDashboardName: userData.managementDashboardName ?? "",
          departmentName: userData.departmentName ?? "",
        });
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
