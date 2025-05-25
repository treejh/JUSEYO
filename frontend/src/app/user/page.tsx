"use client";

import { useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

const UserProfilePage = () => {
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보

  const [userInfo, setUserInfo] = useState({
    managementPageName: loginUser.managementDashboardName || "",
    departmentName: loginUser.departmentName || "",
    name: loginUser.name || "",
    email: loginUser.email || "",
    phoneNumber: loginUser.phoneNumber || "",
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phoneNumber: false,
  });

  const [newPassword, setNewPassword] = useState("");

  const handleSaveName = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 유효성 검사
    if (!userInfo.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (userInfo.name.length > 20) {
      alert("이름은 최대 20자까지 가능합니다.");
      return;
    }
    const nameRegex = /^[가-힣]+$/;
    if (!nameRegex.test(userInfo.name)) {
      alert("이름은 한글만 입력 가능합니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/users/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: userInfo.name }),
      });

      if (!response.ok) throw new Error("이름을 수정할 수 없습니다.");

      const data = await response.json();
      alert("이름이 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, name: data.data.name }));
      setIsEditing((prev) => ({ ...prev, name: false }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleSaveEmail = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 유효성 검사
    if (!userInfo.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      alert("유효한 이메일 형식이 아닙니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/users/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: userInfo.email }),
      });

      if (!response.ok) throw new Error("이메일을 수정할 수 없습니다.");

      const data = await response.json();
      alert("이메일이 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, email: data.data.email }));
      setIsEditing((prev) => ({ ...prev, email: false }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleSavePhoneNumber = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

    // 유효성 검사
    if (!userInfo.phoneNumber.trim()) {
      alert("핸드폰 번호를 입력해주세요.");
      return;
    }
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(userInfo.phoneNumber)) {
      alert("전화번호 형식은 010-1234-5678이어야 합니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/users/phoneNumber`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phoneNumber: userInfo.phoneNumber }),
      });

      if (!response.ok) throw new Error("핸드폰 번호를 수정할 수 없습니다.");

      const data = await response.json();
      alert("핸드폰 번호가 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, phoneNumber: data.data.phoneNumber }));
      setIsEditing((prev) => ({ ...prev, phoneNumber: false }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/v1/user/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) throw new Error("비밀번호를 변경할 수 없습니다.");

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setNewPassword("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        회원 정보 관리
      </h1>

      {/* 관리 페이지 이름 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          관리 페이지 이름
        </label>
        <input
          type="text"
          value={userInfo.managementPageName}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* 부서 이름 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          부서 이름
        </label>
        <input
          type="text"
          value={userInfo.departmentName}
          disabled
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>

      {/* 이름 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">이름</label>
        {isEditing.name ? (
          <div className="flex gap-4">
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              저장
            </button>
            <button
              onClick={() => {
                setUserInfo((prev) => ({ ...prev, name: loginUser.name })); // 초기 값으로 복원
                setIsEditing((prev) => ({ ...prev, name: false })); // 수정 모드 종료
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span>{userInfo.name}</span>
            <button
              onClick={() => setIsEditing((prev) => ({ ...prev, name: true }))}
              className="text-blue-500"
            >
              수정
            </button>
          </div>
        )}
      </div>

      {/* 이메일 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        {isEditing.email ? (
          <div className="flex gap-4">
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSaveEmail}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              저장
            </button>
            <button
              onClick={() => {
                setUserInfo((prev) => ({ ...prev, email: loginUser.email })); // 초기 값으로 복원
                setIsEditing((prev) => ({ ...prev, email: false })); // 수정 모드 종료
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span>{userInfo.email}</span>
            <button
              onClick={() => setIsEditing((prev) => ({ ...prev, email: true }))}
              className="text-blue-500"
            >
              수정
            </button>
          </div>
        )}
      </div>

      {/* 핸드폰 번호 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          핸드폰 번호
        </label>
        {isEditing.phoneNumber ? (
          <div className="flex gap-4">
            <input
              type="text"
              value={userInfo.phoneNumber}
              onChange={(e) =>
                setUserInfo((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="010-1234-5678"
            />
            <button
              onClick={handleSavePhoneNumber}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              저장
            </button>
            <button
              onClick={() => {
                setUserInfo((prev) => ({
                  ...prev,
                  phoneNumber: loginUser.phoneNumber,
                })); // 초기 값으로 복원
                setIsEditing((prev) => ({ ...prev, phoneNumber: false })); // 수정 모드 종료
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              취소
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span>{userInfo.phoneNumber}</span>
            <button
              onClick={() =>
                setIsEditing((prev) => ({ ...prev, phoneNumber: true }))
              }
              className="text-blue-500"
            >
              수정
            </button>
          </div>
        )}
      </div>

      {/* 비밀번호 변경 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <div className="flex gap-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호 입력"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            변경
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
