"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  checkEmailDuplication,
  sendAuthCode,
  verifyAuthCode,
} from "@/utils/emailValidation";

export default function InitialSignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
  });
  const [authCode, setAuthCode] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false); // 중복 확인 완료 여부
  const [isEmailDuplicated, setIsEmailDuplicated] = useState(false); // 중복 여부 (true면 중복된 것)
  const [authCodeSent, setAuthCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // 이메일 형식 검증
  const isValidEmailFormat = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 타이머 관리
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (authCodeSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      setAuthCodeSent(false);
    }

    return () => clearInterval(interval);
  }, [authCodeSent, timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailCheck = async () => {
    if (!formData.email) return alert("이메일을 입력해주세요.");
    if (!isValidEmailFormat(formData.email))
      return alert("유효한 이메일 형식이 아닙니다.");

    try {
      const isDuplicated = await checkEmailDuplication(formData.email);
      setIsEmailChecked(true);
      setIsEmailDuplicated(isDuplicated);
      if (!isDuplicated) {
        alert("사용 가능한 이메일입니다. 인증번호를 발급받아주세요.");
      } else {
        alert("이미 사용 중인 이메일입니다.");
      }
    } catch (error) {
      console.error(error);
      alert("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSendAuthCode = async () => {
    if (!formData.email) return alert("이메일을 입력해주세요.");
    if (!isValidEmailFormat(formData.email))
      return alert("유효한 이메일 형식이 아닙니다.");

    try {
      setIsLoading(true);
      const isSent = await sendAuthCode(formData.email);
      if (isSent) {
        setAuthCodeSent(true);
        setTimer(120);
        alert("인증번호가 발송되었습니다. 2분 내에 입력해주세요.");
      } else {
        alert("인증번호 발급 실패. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error(err);
      alert("인증번호 발급 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAuthCode = async () => {
    try {
      const isVerified = await verifyAuthCode(formData.email, authCode);
      if (isVerified) {
        alert("이메일 인증이 완료되었습니다.");
        setIsEmailVerified(true);
        setAuthCodeSent(false);
      } else {
        alert("인증번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailChecked || isEmailDuplicated || !isEmailVerified) {
      return alert("이메일 인증이 완료되지 않았습니다.");
    }

    console.log("회원가입 요청:", formData);
    // 회원가입 API 호출 로직
  };

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center gap-x-50">
      <div className="w-1/4 h-full flex-shrink-0 flex flex-col justify-center">
        <div className="pl-0">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Juseyo 로고"
              className="h-10 mb-8 rounded-xl shadow-md"
            />
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">
            회원가입
          </h1>
          <p className="text-lg mb-2 text-gray-600">
            재고 관리 플랫폼 Juseyo에 오신 것을 환영합니다.
          </p>
          <p className="text-base text-gray-500 mb-6">
            계정에 로그인하여 재고를 효율적으로 관리하세요.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shadow-xl rounded-2xl overflow-hidden w-full max-w-[500px] bg-white"
      >
        <div className="bg-[#0047AB] text-white px-8 py-5 text-center">
          <h2 className="text-2xl font-bold">회원가입</h2>
          <p className="text-base mt-2 opacity-80">
            새로운 관리 페이지를 생성하고 회원가입을 완료하세요.
          </p>
        </div>

        <div className="px-8 py-8">
          {/* 이메일 */}
          <label className="block text-base font-medium text-gray-700 mb-2">
            이메일
          </label>
          <div className="mb-5 flex items-center">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEmailVerified}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="이메일을 입력하세요"
            />
            <button
              type="button"
              onClick={handleEmailCheck}
              disabled={isEmailVerified}
              className={`ml-4 px-4 py-2 rounded-lg text-white w-32 ${
                isEmailVerified
                  ? "bg-gray-400"
                  : "bg-[#0047AB] hover:bg-blue-800"
              }`}
            >
              {isEmailVerified ? "완료됨" : "중복 확인"}
            </button>
          </div>

          {/* 인증번호 입력 */}
          {isEmailChecked && !isEmailDuplicated && !isEmailVerified && (
            <div className="mb-5">
              <label className="block text-base font-medium text-gray-700 mb-2">
                이메일 인증
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
                  placeholder="인증번호를 입력하세요"
                  disabled={timer === 0 && !authCodeSent}
                />
                <button
                  type="button"
                  onClick={
                    authCodeSent ? handleVerifyAuthCode : handleSendAuthCode
                  }
                  className="w-64 ml-4 px-4 py-2 rounded-lg text-white bg-[#0047AB]"
                >
                  {authCodeSent
                    ? "인증"
                    : isLoading
                    ? "로딩중..."
                    : "인증번호 받기"}
                </button>
              </div>
              {authCodeSent && (
                <p className="text-sm text-gray-500 mt-2">
                  남은 시간: {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </p>
              )}
            </div>
          )}

          {/* 인증 완료 메시지 */}
          {isEmailVerified && (
            <p className="text-sm text-green-600 mt-2">
              이메일 인증이 완료되었습니다.
            </p>
          )}

          {/* 기타 입력 */}
          <div className="mb-5">
            <label className="block text-base font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="이름을 입력하세요"
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
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
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
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <div className="mb-5">
            <label className="block text-base font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0047AB] focus:outline-none"
              placeholder="전화번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0047AB] text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "회원가입"}
          </button>
        </div>
      </form>
    </div>
  );
}
