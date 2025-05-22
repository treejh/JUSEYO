"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginType = searchParams.get("type"); // 쿼리 파라미터에서 로그인 유형 가져오기

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-2xl overflow-hidden w-3/4 max-w-md mx-auto"
      >
        <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
          <h2 className="text-2xl font-bold">
            {loginType === "manager" ? "매니저 로그인" : "일반 회원 로그인"}
          </h2>
          <p className="text-base mt-2 opacity-80">
            계정 정보를 입력하여 로그인하세요.
          </p>
        </div>
        <div className="bg-white px-8 py-8">
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
      </form>
    </div>
  );
}
