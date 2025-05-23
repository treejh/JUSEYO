"use client";

import { useState } from "react";

export default function MemberSignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사 및 회원가입 처리 로직
    console.log("회원가입 데이터:", formData);
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-2xl overflow-hidden w-full max-w-md bg-white"
      >
        <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
          <h2 className="text-2xl font-bold">일반 회원 가입</h2>
          <p className="text-base mt-2 opacity-80">
            일반 회원으로 가입하여 재고를 효율적으로 관리하세요.
          </p>
        </div>
        <div className="px-8 py-8">
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
          <div className="mb-5">
            <label className="block text-base font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#0047AB] text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "회원가입"}
          </button>
        </div>
      </form>
    </div>
  );
}
