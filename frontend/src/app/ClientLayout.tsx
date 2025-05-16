"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginMember";
import { Header } from "./components/Header";
import { useNotificationStore } from "@/stores/notifications";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

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
                      id: parsed.id,
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
  }, []);

  if (isLoginUserPending) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white text-black">
        <div>로딩중</div>
      </div>
    );
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
          {children}
        </main>
      </div>
    </LoginUserContext.Provider>
  );
}
