"use client";

import { useState } from "react";
import { checkEmailDuplication } from "@/utils/emailValidation";
import Link from "next/link";

export default function FindPasswordPage() {
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingPassword, setIsSendingPassword] = useState(false); // 비밀번호 전송 상태
  const [showNotification, setShowNotification] = useState(false); // 알림 표시 상태

  // 이메일 중복 확인
  const handleCheckEmailDuplication = async () => {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("유효한 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const isDuplicate = await checkEmailDuplication(email);
      if (isDuplicate) {
        setIsEmailVerified(true);
        setMessage("이메일이 존재합니다.");
      } else {
        setIsEmailVerified(false);
        setError("존재하지 않는 이메일입니다.");
      }
    } catch (error) {
      setError("이메일 확인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일로 비밀번호 전송
  const sendPasswordByEmail = async () => {
    setError("");
    setMessage("");
    setIsSendingPassword(true); // 로딩 상태 시작
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${API_URL}/api/v1/users/emails/findPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("비밀번호 전송에 실패했습니다.");
      }

      setShowNotification(true); // 알림 표시
      setMessage(`임시 비밀번호가 ${email}로 전송되었습니다.`);
    } catch (error) {
      setError("비밀번호 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingPassword(false); // 로딩 상태 종료
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4 relative">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0047AB]">비밀번호 찾기</h2>
          <p className="text-gray-500 mt-2 text-sm">
            이메일을 입력하고 확인을 완료하면 임시 비밀번호를 받을 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일 주소
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="이메일을 입력하세요"
            disabled={isEmailVerified}
          />
          {!isEmailVerified && (
            <button
              type="button"
              onClick={handleCheckEmailDuplication}
              className="w-full mt-2 py-2 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? "확인 중..." : "이메일 확인"}
            </button>
          )}
        </div>

        {isEmailVerified && (
          <div className="mb-4">
            <button
              onClick={sendPasswordByEmail}
              className="w-full py-3 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60"
              disabled={isSendingPassword}
            >
              {isSendingPassword ? "비밀번호 전송 중..." : "임시 비밀번호 받기"}
            </button>
          </div>
        )}

        <div className="bg-gray-50 px-8 py-4 text-center">
          <div className="flex justify-center space-x-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base mr-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              홈으로 돌아가기
            </Link>

            <Link
              href="/login/type"
              className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              로그인 하기
            </Link>
          </div>
        </div>
      </form>

      {showNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-md p-4 max-w-xs w-full z-50">
          <p className="text-sm text-gray-700">
            임시 비밀번호가 {email}로 전송되었습니다.
          </p>
          <button
            onClick={() => setShowNotification(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
