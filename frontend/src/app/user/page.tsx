"use client";

import { useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import {
  updateUserName,
  updateUserEmail,
  updateUserPhoneNumber,
  updateUserPassword,
} from "@/utils/modifyUser";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const handleSaveName = async () => {
    try {
      const data = await updateUserName(userInfo.name);
      alert("이름이 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, name: data.data.name }));
      setIsEditing((prev) => ({ ...prev, name: false }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleSaveEmail = async () => {
    try {
      const data = await updateUserEmail(userInfo.email);
      alert("이메일이 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, email: data.data.email }));
      setIsEditing((prev) => ({ ...prev, email: false }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleSavePhoneNumber = async () => {
    try {
      const data = await updateUserPhoneNumber(userInfo.phoneNumber);
      alert("핸드폰 번호가 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, phoneNumber: data.data.phoneNumber }));
      setIsEditing((prev) => ({ ...prev, phoneNumber: false }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      const data = await updateUserPassword(currentPassword, newPassword);
      alert("비밀번호가 성공적으로 변경되었습니다.");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-12">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        사용자 정보
      </h1>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{userInfo.name}</h2>
        <p className="text-gray-500">{userInfo.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 관리 페이지 이름 */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">관리 페이지</h3>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {userInfo.managementPageName}
          </p>
        </div>

        {/* 부서 이름 */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">부서</h3>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {userInfo.departmentName}
          </p>
        </div>

        {/* 이름 */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">이름</h3>
          {isEditing.name ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg font-semibold text-gray-800">
                {userInfo.name}
              </p>
              <button
                onClick={() =>
                  setIsEditing((prev) => ({ ...prev, name: true }))
                }
                className="text-blue-500"
              >
                수정
              </button>
            </div>
          )}
        </div>

        {/* 이메일 */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">이메일</h3>
          {isEditing.email ? (
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg font-semibold text-gray-800">
                {userInfo.email}
              </p>
              <button
                onClick={() =>
                  setIsEditing((prev) => ({ ...prev, email: true }))
                }
                className="text-blue-500"
              >
                수정
              </button>
            </div>
          )}
        </div>

        {/* 핸드폰 번호 */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">핸드폰 번호</h3>
          {isEditing.phoneNumber ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={userInfo.phoneNumber}
                onChange={(e) =>
                  setUserInfo((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg font-semibold text-gray-800">
                {userInfo.phoneNumber}
              </p>
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
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">비밀번호 변경</h3>
          <div className="flex flex-col gap-4 mt-2">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
    </div>
  );
};

export default UserProfilePage;
