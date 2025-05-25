"use client";

import { useState } from "react";
import Link from "next/link";

export default function FindEmailPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setIsLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(
        `${API_URL}/api/v1/users/find-password/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "비밀번호 찾기에 실패했습니다.");
      }

      setMessage("임시 비밀번호가 전송되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0047AB]">비밀번호 찾기</h2>
          <p className="text-gray-500 mt-2 text-sm">
            이메일을 입력하여 임시 비밀번호를 전송받을 수 있습니다.
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
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "찾는 중..." : "이메일 찾기"}
        </button>
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
    </div>
  );
}
