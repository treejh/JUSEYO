"use client";

import { useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import {
  updateUserName,
  updateUserEmail,
  updateUserPhoneNumber,
  updateUserPassword,
} from "@/utils/modifyUser";
import {
  checkEmailDuplication,
  sendAuthCode,
  verifyAuthCode,
} from "@/utils/emailValidation";
import {
  checkPhoneDuplication,
  sendPhoneAuthCode,
  verifyPhoneAuthCode,
} from "@/utils/phoneValidation";

const UserProfilePage = () => {
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

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
    password: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [authCodeSent, setAuthCodeSent] = useState(false);
  const [timer, setTimer] = useState(300); // 5분 타이머

  const [isPhoneChecked, setIsPhoneChecked] = useState(false); // 핸드폰 중복 확인 상태
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // 핸드폰 인증 상태
  const [phoneAuthCode, setPhoneAuthCode] = useState(""); // 핸드폰 인증 코드
  const [isPhoneAuthLoading, setIsPhoneAuthLoading] = useState(false); // 로딩 상태
  const [phoneTimer, setPhoneTimer] = useState(120); // 2분 타이머

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

  const isValidEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleVerifyEmail = async () => {
    if (!userInfo.email || !isValidEmailFormat(userInfo.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      setIsEmailLoading(true);
      await checkEmailDuplication(userInfo.email);
      alert("사용 가능한 이메일입니다.");
      setIsEmailChecked(true);

      await sendAuthCode(userInfo.email);
      alert("인증 코드가 발송되었습니다.");
      setAuthCodeSent(true);

      // 2분 타이머 시작
      let timeLeft = 120;
      setTimer(timeLeft);
      const timerInterval = setInterval(() => {
        timeLeft -= 1;
        setTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          setAuthCodeSent(false);
        }
      }, 1000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
      setIsEmailChecked(false); // 실패 시 재확인 가능하게
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    try {
      // 인증 코드 확인
      await verifyAuthCode(userInfo.email, verificationCode);
      alert("인증이 완료되었습니다.");
      setIsVerified(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    }
  };

  const handleSaveEmail = async () => {
    if (!isVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      const data = await updateUserEmail(userInfo.email);
      alert("이메일이 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, email: data.data.email }));
      setIsEditing((prev) => ({ ...prev, email: false }));
      setIsVerified(false); // 인증 상태 초기화
      setIsEmailChecked(false); // 이메일 중복 확인 상태 초기화
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

  const handleVerifyPhoneNumber = async () => {
    if (
      !userInfo.phoneNumber ||
      !/^\d{3}-\d{4}-\d{4}$/.test(userInfo.phoneNumber)
    ) {
      alert("올바른 핸드폰 번호 형식을 입력해주세요. (예: 010-1234-5678)");
      return;
    }

    try {
      setIsPhoneAuthLoading(true);
      await checkPhoneDuplication(userInfo.phoneNumber);
      alert("사용 가능한 핸드폰 번호입니다.");
      setIsPhoneChecked(true);

      await sendPhoneAuthCode(userInfo.phoneNumber);
      alert("인증 코드가 발송되었습니다.");
      setPhoneTimer(120); // 2분 타이머 시작
      const timerInterval = setInterval(() => {
        setPhoneTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
      setIsPhoneChecked(false); // 실패 시 재확인 가능하게
    } finally {
      setIsPhoneAuthLoading(false);
    }
  };

  const handleConfirmPhoneCode = async () => {
    try {
      // 핸드폰 인증 코드 확인
      await verifyPhoneAuthCode(userInfo.phoneNumber, phoneAuthCode);
      alert("핸드폰 인증이 완료되었습니다.");
      setIsPhoneVerified(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "인증 코드가 올바르지 않습니다."
      );
    }
  };

  const handleSavePhone = async () => {
    if (!isPhoneVerified) {
      alert("핸드폰 인증을 완료해주세요.");
      return;
    }

    try {
      const data = await updateUserPhoneNumber(userInfo.phoneNumber);
      alert("핸드폰 번호가 성공적으로 수정되었습니다.");
      setUserInfo((prev) => ({ ...prev, phoneNumber: data.data.phoneNumber }));
      setIsEditing((prev) => ({ ...prev, phoneNumber: false }));
      setIsPhoneVerified(false); // 인증 상태 초기화
      setIsPhoneChecked(false); // 핸드폰 중복 확인 상태 초기화
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
            <div className="flex flex-col gap-4 mt-2">
              {/* 이메일 입력 */}
              <div className="flex items-center">
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={isVerified || isEmailChecked} // 중복 확인 완료 시 비활성화
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="이메일을 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isVerified || isEmailChecked || isEmailLoading}
                  className={`ml-3 px-4 py-2 rounded-lg text-white text-sm min-w-[100px] ${
                    isVerified || isEmailChecked || isEmailLoading
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isEmailLoading
                    ? "로딩중..."
                    : isVerified
                    ? "완료됨"
                    : isEmailChecked
                    ? "중복 확인 완료"
                    : "중복 확인"}
                </button>
              </div>
              {isVerified && (
                <p className="text-sm mt-1 text-blue-500">
                  이메일 인증이 완료되었습니다.
                </p>
              )}

              {/* 인증번호 입력 */}
              {isEmailChecked && !isVerified && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    이메일 인증
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="인증번호를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmCode}
                      className="ml-3 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm min-w-[100px] hover:bg-blue-600"
                    >
                      인증
                    </button>
                  </div>
                  {authCodeSent && (
                    <p className="text-xs text-gray-500 mt-1">
                      남은 시간: {Math.floor(timer / 60)}:
                      {String(timer % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>
              )}

              {/* 저장 및 취소 버튼 */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    if (!isEmailChecked) {
                      alert("이메일 중복 확인이 완료되지 않았습니다.");
                      return;
                    }
                    if (!isVerified) {
                      alert("이메일 인증이 완료되지 않았습니다.");
                      return;
                    }
                    handleSaveEmail();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  //disabled={!isEmailChecked || !isVerified} // 버튼 비활성화 조건 추가
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setUserInfo((prev) => ({
                      ...prev,
                      email: loginUser.email,
                    })); // 초기 값으로 복원
                    setIsEditing((prev) => ({ ...prev, email: false })); // 수정 모드 종료
                    setIsVerified(false); // 인증 상태 초기화
                    setIsEmailChecked(false); // 이메일 중복 확인 상태 초기화
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  취소
                </button>
              </div>
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
            <div className="flex flex-col gap-4 mt-2">
              {/* 핸드폰 번호 입력 */}
              <div className="flex items-center">
                <input
                  type="text"
                  value={userInfo.phoneNumber}
                  onChange={(e) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  disabled={isPhoneChecked || isPhoneVerified} // 중복 확인 완료 시 비활성화
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="010-1234-5678"
                />
                <button
                  type="button"
                  onClick={handleVerifyPhoneNumber}
                  disabled={
                    isPhoneChecked || isPhoneVerified || isPhoneAuthLoading
                  }
                  className={`ml-3 px-4 py-2 rounded-lg text-white text-sm min-w-[100px] ${
                    isPhoneChecked || isPhoneVerified || isPhoneAuthLoading
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isPhoneAuthLoading
                    ? "로딩중..."
                    : isPhoneVerified
                    ? "완료됨"
                    : isPhoneChecked
                    ? "중복 확인 완료"
                    : "중복 확인"}
                </button>
              </div>
              {isPhoneVerified && (
                <p className="text-sm mt-1 text-blue-500">
                  핸드폰 인증이 완료되었습니다.
                </p>
              )}

              {/* 인증번호 입력 */}
              {isPhoneChecked && !isPhoneVerified && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    핸드폰 인증
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={phoneAuthCode}
                      onChange={(e) => setPhoneAuthCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="인증번호를 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmPhoneCode}
                      className="ml-3 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm min-w-[100px] hover:bg-blue-600"
                    >
                      인증
                    </button>
                  </div>
                  {phoneTimer > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      남은 시간: {Math.floor(phoneTimer / 60)}:
                      {String(phoneTimer % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>
              )}

              {/* 저장 및 취소 버튼 */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    if (!isPhoneChecked) {
                      alert("핸드폰 중복 확인이 완료되지 않았습니다.");
                      return;
                    }
                    if (!isPhoneVerified) {
                      alert("핸드폰 인증이 완료되지 않았습니다.");
                      return;
                    }
                    handleSavePhoneNumber();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  disabled={!isPhoneChecked || !isPhoneVerified} // 버튼 비활성화 조건 추가
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
                    setIsPhoneChecked(false); // 중복 확인 상태 초기화
                    setIsPhoneVerified(false); // 인증 상태 초기화
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  취소
                </button>
              </div>
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
          {isEditing.password ? (
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
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  변경
                </button>
                <button
                  onClick={() => {
                    setIsEditing((prev) => ({ ...prev, password: false })); // 수정 모드 종료
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg font-semibold text-gray-800">********</p>
              <button
                onClick={() =>
                  setIsEditing((prev) => ({ ...prev, password: true }))
                }
                className="text-blue-500"
              >
                수정
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
