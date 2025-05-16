import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  phoneNumber: string;
  username: string;
  managementDashboardName?: string; // 선택적 필드
  departmentName?: string; // 선택적 필드
  userType?: "manager" | "regular"; // 사용자 타입 필드 추가
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
    username: "",
    managementDashboardName: "",
    departmentName: "",
    userType: "regular", // 기본값 설정
  };
}

export function useLoginUser() {
  const router = useRouter();

  const [isLoginUserPending, setLoginUserPending] = useState(true);
  const [loginUser, _setLoginUser] = useState<User>(createEmptyUser());

  const removeLoginUser = () => {
    _setLoginUser(createEmptyUser());
    setLoginUserPending(false);
  };

  const setLoginUser = (user: User) => {
    _setLoginUser(user);
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

    logout,
    logoutAndHome,
  };
}

export function useGlobalLoginUser() {
  return useContext(LoginUserContext);
}
