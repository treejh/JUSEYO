import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  phoneNumber: string;
  name: string;
  managementDashboardName?: string; // 선택적 필드
  departmentName?: string; // 선택적 필드
  role: string; // 사용자 타입 필드 추가
  approvalStatus?: string; // 승인 상태 필드 추가
};

export const LoginUserContext = createContext<{
  loginUser: User;
  setLoginUser: (user: User) => void;
  isLoginUserPending: boolean;
  isLogin: boolean;
  logout: (callback: () => void) => void;
  logoutAndHome: () => void;
}>({
  loginUser: createEmptyUser(),
  setLoginUser: () => {},
  isLoginUserPending: true,
  isLogin: false,
  logout: () => {},
  logoutAndHome: () => {},
});

function createEmptyUser(): User {
  return {
    id: 0,
    email: "",
    phoneNumber: "",
    name: "",
    managementDashboardName: "",
    departmentName: "",
    role: "", // 기본값 설정
    approvalStatus: "", // 기본값 설정
  };
}

export function useLoginUser() {
  const router = useRouter();

  const [isLoginUserPending, setLoginUserPending] = useState(true);
  const [loginUser, _setLoginUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("loginUser");
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    }
    return createEmptyUser();
  });

  const removeLoginUser = () => {
    _setLoginUser(createEmptyUser());
    localStorage.removeItem("loginUser");
    setLoginUserPending(false);
  };

  const setLoginUser = (user: User) => {
    _setLoginUser(user);
    localStorage.setItem("loginUser", JSON.stringify(user));
    setLoginUserPending(false);
  };

  const setNoLoginUser = () => {
    setLoginUserPending(false);
  };

  const isLogin = loginUser.id !== 0;

  const logout = (callback: () => void) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      removeLoginUser();
      callback();
    });
  };

  const logoutAndHome = () => {
    logout(() => router.replace("/"));
  };

  return {
    loginUser: loginUser,
    setLoginUser: setLoginUser,
    isLoginUserPending: isLoginUserPending,
    setNoLoginUser: setNoLoginUser,
    isLogin,
    removeLoginUser,
    logout,
    logoutAndHome,
  };
}

export function useGlobalLoginUser() {
  return useContext(LoginUserContext);
}
