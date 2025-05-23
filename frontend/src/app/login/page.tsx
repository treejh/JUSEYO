"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginType = searchParams.get("type"); // 쿼리 파라미터에서 로그인 유형 가져오기

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleBackToSelection = () => {
    router.push("/login/type");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await fetch(`${API_URL}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "로그인에 실패했습니다.");
      }

      router.push("/dashboard"); // 로그인 성공 시 대시보드로 이동
    } catch (error) {
      setError(error instanceof Error ? error.message : "로그인 중 오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center gap-x-50">
      {/* 왼쪽 콘텐츠 */}
      <div className="w-1/4 h-full flex-shrink-0 flex flex-col justify-center ">
        <div className="pl-0">
          <Link href="/">
            <p className="text-slate-600 mb-8 max-w-xl"></p>
            <img
              src="/logo.png"
              alt="Juseyo 로고"
              className="h-10 mb-8 rounded-xl shadow-md"
            />
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">
            로그인
          </h1>
          <p className="text-lg mb-2 text-gray-600">
            재고 관리 플랫폼 Juseyo에 오신 것을 환영합니다.
          </p>
          <p className="text-base text-gray-500 mb-6">
            계정에 로그인하여 재고를 효율적으로 관리하세요.
          </p>
        </div>
      </div>

      {/* 로그인 폼 */}
      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-2xl overflow-hidden w-full max-w-md bg-white"
      >
        <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
          <h2 className="text-2xl font-bold">
            {loginType === "manager" ? "매니저 로그인" : "회원 로그인"}
          </h2>
          <p className="text-base mt-2 opacity-80">
            계정 정보를 입력하여 로그인하세요.
          </p>
        </div>

        <div className="bg-white px-8 py-8">
          <button
            type="button"
            onClick={handleBackToSelection}
            className="text-gray-500 hover:text-[#0047AB] transition-colors flex items-center mb-2 text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            유형 선택으로 돌아가기
          </button>
        </div>
        <div className="flex flex-col items-center mb-1">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#0047AB]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>
        <div className="px-8 py-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-base">
              {error}
            </div>
          )}
          <div className="mb-5">
            <label className="block text-base font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div className="mb-5">
            <label className="block text-base font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0047AB] text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
          <div className="mt-4 text-center">
            <a href="#" className="text-[#0047AB] hover:underline">
              비밀번호를 잊으셨나요?
            </a>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
          <div className="flex justify-center space-x-6">
            <Link
              href="/"
              className="flex items-center justify-center px-6 py-2 border border-[#0047AB] text-[#0047AB] rounded-lg font-medium hover:bg-blue-50 transition-colors text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              홈으로
            </Link>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="flex items-center justify-center px-6 py-2 bg-[#0047AB] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              회원가입하기
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
