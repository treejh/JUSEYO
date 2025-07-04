"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useCustomToast } from "@/utils/toast";

export default function InitialSignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
    managementPageName: "",
    departmentName: "",
  });
  const router = useRouter();
  const [authCode, setAuthCode] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
  const [authCodeSent, setAuthCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const [phoneAuthCode, setPhoneAuthCode] = useState("");
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [isPhoneDuplicated, setIsPhoneDuplicated] = useState(false);
  const [phoneAuthCodeSent, setPhoneAuthCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);

  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  const toast = useCustomToast();

  // 유효성 검사 함수들
  const isValidEmailFormat = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidName = (name: string): boolean =>
    name.trim() !== "" && name.length <= 20 && /^[가-힣]+$/.test(name);

  const isValidPassword = (password: string): boolean =>
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*\W).{8,20}$/.test(password);

  const isValidPhoneNumberFormat = (phoneNumber: string): boolean =>
    /^010-\d{4}-\d{4}$/.test(phoneNumber);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (authCodeSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && authCodeSent) {
      setAuthCodeSent(false); // 타이머가 0일 때만 상태 변경
    }
    return () => clearInterval(interval);
  }, [authCodeSent, timer]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (phoneAuthCodeSent && phoneTimer > 0) {
      interval = setInterval(() => setPhoneTimer((prev) => prev - 1), 1000);
    } else if (phoneTimer === 0 && phoneAuthCodeSent) {
      setPhoneAuthCodeSent(false); // 타이머가 0일 때만 상태 변경
    }
    return () => clearInterval(interval);
  }, [phoneAuthCodeSent, phoneTimer]);

  useEffect(() => {
    // 로컬 스토리지에서 관리 페이지 이름과 부서 이름 가져오기
    const managementPageName = localStorage.getItem("managementPageName");
    const departmentName = localStorage.getItem("departmentName");

    if (!managementPageName || !departmentName) {
      // 관리 페이지 이름과 부서 이름이 없으면 /signup/info로 리다이렉트
      router.push("/signup/info");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      managementPageName,
      departmentName,
    }));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailCheck = async () => {
    if (!formData.email) return toast.error("이메일을 입력해주세요.");
    if (!isValidEmailFormat(formData.email))
      return toast.error("유효한 이메일 형식이 아닙니다.");
    try {
      const isDuplicated = await checkEmailDuplication(formData.email);
      setIsEmailChecked(true);
      setIsEmailDuplicated(isDuplicated);

      if (isDuplicated) {
        toast.error("이미 사용 중인 이메일입니다. 다시 확인해주세요.");
        setIsEmailChecked(false); // 다시 중복 확인 가능하도록 상태 초기화
      } else {
        toast.success("사용 가능한 이메일입니다. 인증번호를 발급받아주세요.");
      }
    } catch {
      toast.error("중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSendAuthCode = async () => {
    if (!formData.email) return toast.error("이메일을 입력해주세요.");
    if (!isValidEmailFormat(formData.email))
      return toast.error("유효한 이메일 형식이 아닙니다.");
    try {
      setIsEmailLoading(true);
      const isSent = await sendAuthCode(formData.email);
      if (isSent) {
        setAuthCodeSent(true);
        setTimer(120);
        toast.success("인증번호가 발송되었습니다. 2분 내에 입력해주세요.");
      } else {
        toast.error("인증번호 발급 실패. 다시 시도해주세요.");
      }
    } catch {
      toast.error("인증번호 발급 중 오류가 발생했습니다.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVerifyAuthCode = async () => {
    try {
      const isVerified = await verifyAuthCode(formData.email, authCode);
      if (isVerified) {
        toast.success("이메일 인증이 완료되었습니다.");
        setIsEmailVerified(true);
        setAuthCodeSent(false);
      } else {
        toast.error("인증번호가 일치하지 않습니다.");
      }
    } catch {
      toast.error("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  const handlePhoneCheck = async () => {
    if (!formData.phoneNumber) return toast.error("전화번호를 입력해주세요.");
    if (!isValidPhoneNumberFormat(formData.phoneNumber))
      return toast.error("전화번호 형식이 올바르지 않습니다. 형식: 010-1234-5678");
    try {
      const isDuplicated = await checkPhoneDuplication(formData.phoneNumber);
      setIsPhoneChecked(true);
      setIsPhoneDuplicated(isDuplicated);
      if (isDuplicated) {
        toast.error("이미 사용 중인 전화번호입니다. 다시 확인해주세요.");
        setIsPhoneChecked(false); // 다시 중복 확인 가능하도록 상태 초기화
      } else {
        toast.success("사용 가능한 전화번호입니다. 인증번호를 발급받아주세요.");
      }
    } catch {
      toast.error("전화번호 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSendPhoneAuthCode = async () => {
    if (!formData.phoneNumber) return toast.error("전화번호를 입력해주세요.");
    if (!isValidPhoneNumberFormat(formData.phoneNumber))
      return toast.error("전화번호 형식이 올바르지 않습니다. 형식: 010-1234-5678");
    try {
      setIsPhoneLoading(true);
      const isSent = await sendPhoneAuthCode(formData.phoneNumber);
      if (isSent) {
        setPhoneAuthCodeSent(true);
        setPhoneTimer(120);
        toast.success("인증번호가 발송되었습니다. 2분 내에 입력해주세요.");
      } else {
        toast.error("인증번호 발급 실패. 다시 시도해주세요.");
      }
    } catch {
      toast.error("인증번호 발급 중 오류가 발생했습니다.");
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleVerifyPhoneAuthCode = async () => {
    try {
      const isVerified = await verifyPhoneAuthCode(
        formData.phoneNumber,
        phoneAuthCode
      );
      if (isVerified) {
        toast.success("전화번호 인증이 완료되었습니다.");
        setIsPhoneVerified(true);
        setPhoneAuthCodeSent(false);
      } else {
        toast.error("인증번호가 일치하지 않습니다.");
      }
    } catch {
      toast.error("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phoneNumber: string;
  }

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailChecked || isEmailDuplicated || !isEmailVerified)
      return toast.error("이메일 인증이 완료되지 않았습니다.");
    if (!isPhoneChecked || isPhoneDuplicated || !isPhoneVerified)
      return toast.error("핸드폰 인증이 완료되지 않았습니다.");

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.phoneNumber
    ) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    // 이름 검증
    if (!formData.name) {
      toast.error("이름은 필수입니다.");
      return;
    }
    if (!isValidName(formData.name)) {
      toast.error("이름은 한글만 입력 가능하며 최대 20자까지 가능합니다.");
      return;
    }
    // 이메일 검증
    if (!formData.email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    if (!isValidEmailFormat(formData.email)) {
      toast.error("유효한 이메일 형식이 아닙니다.");
      return;
    }

    // 비밀번호 검사
    if (!formData.password) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }
    if (!isValidPassword(formData.password)) {
      toast.error("비밀번호는 영문자, 숫자, 특수문자를 포함한 8~20자리여야 합니다.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 전화번호 검사
    if (!formData.phoneNumber) {
      toast.error("전화번호를 입력해주세요.");
      return;
    }
    if (!isValidPhoneNumberFormat(formData.phoneNumber)) {
      toast.error("전화번호 형식은 010-1234-5678이어야 합니다.");
      return;
    }

    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_URL}/api/v1/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("회원가입에 실패했습니다.");
      }

      toast.success("회원가입이 완료되었습니다.");
      localStorage.removeItem("managementPageName");
      localStorage.removeItem("departmentName");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center overflow-hidden">
      <div className="flex gap-x-24 max-w-[1400px] mx-auto">
        <div className="w-1/3 flex-shrink-0 flex flex-col justify-center">
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
        <div className="w-2/3 flex items-center">
          <form
            onSubmit={handleSubmit}
            className="shadow-xl rounded-2xl overflow-hidden w-[800px]"
          >
            <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
              <h2 className="text-2xl font-bold">회원가입</h2>
              <p className="text-base mt-2 opacity-80">
                회원가입을 완료하여 조직의 재고를 관리하세요.
              </p>
            </div>

            <div className="bg-white px-8 py-6 overflow-y-auto max-h-[600px]">
              {/* Form fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* 이메일 */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <div className="mb-4 w-full">
                <div className="flex items-center">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isEmailVerified || isEmailChecked} // 중복 확인 완료 시 비활성화
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                    placeholder="이메일을 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={handleEmailCheck}
                    disabled={isEmailVerified || isEmailChecked}
                    className={`ml-3 px-7 py-2.5 rounded-lg text-white text-sm min-w-[100px] whitespace-nowrap flex items-center justify-center ${
                      isEmailVerified || isEmailChecked
                        ? "bg-gray-400"
                        : "bg-[#0047AB] hover:bg-blue-800"
                    }`}
                  >
                    {isEmailVerified
                      ? "완료됨"
                      : isEmailChecked
                      ? "중복 확인 완료"
                      : "중복 확인"}
                  </button>
                </div>

                {/* ✅ input 바로 아래 메시지 (margin-top만 살짝 줌) */}
                {isEmailVerified && (
                  <p className="text-sm mt-1 text-[#0047AB]">
                    이메일 인증이 완료되었습니다.
                  </p>
                )}
              </div>

              {/* 인증번호 입력 */}
              {isEmailChecked && !isEmailDuplicated && !isEmailVerified && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 인증
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                      placeholder="인증번호를 입력하세요"
                      disabled={timer === 0 && !authCodeSent}
                    />
                    <button
                      type="button"
                      onClick={
                        authCodeSent ? handleVerifyAuthCode : handleSendAuthCode
                      }
                      className="ml-3 px-7 py-2.5 rounded-lg bg-[#0047AB] text-white text-sm min-w-[100px] whitespace-nowrap flex items-center justify-center"
                    >
                      {authCodeSent
                        ? "인증"
                        : isEmailLoading
                        ? "로딩중..."
                        : "인증번호 받기"}
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

              {/* 전화번호 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={isPhoneVerified || isPhoneChecked} // 중복 확인 완료 시 비활성화
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                    placeholder="전화번호를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={handlePhoneCheck}
                    disabled={isPhoneVerified || isPhoneChecked}
                    className={`ml-3 px-7 py-2.5 rounded-lg text-white text-sm min-w-[100px] whitespace-nowrap flex items-center justify-center ${
                      isPhoneVerified || isPhoneChecked
                        ? "bg-gray-400"
                        : "bg-[#0047AB] hover:bg-blue-800"
                    }`}
                  >
                    {isPhoneVerified
                      ? "완료됨"
                      : isPhoneChecked
                      ? "중복 확인 완료"
                      : "중복 확인"}
                  </button>
                </div>

                {/* ✅ 전화번호 인증 완료 메시지 - input 바로 아래에 오도록 */}
                {isPhoneVerified && (
                  <p className="text-sm mt-1 text-[#0047AB]">
                    전화번호 인증이 완료되었습니다.
                  </p>
                )}

                {/* 인증번호 입력 */}
                {isPhoneChecked && !isPhoneDuplicated && !isPhoneVerified && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 인증
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={phoneAuthCode}
                        onChange={(e) => setPhoneAuthCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                        placeholder="인증번호를 입력하세요"
                        disabled={phoneTimer === 0 && !phoneAuthCodeSent}
                      />
                      <button
                        type="button"
                        onClick={
                          phoneAuthCodeSent
                            ? handleVerifyPhoneAuthCode
                            : handleSendPhoneAuthCode
                        }
                        className="ml-3 px-3 py-3 rounded-lg text-white text-sm bg-[#0047AB] hover:bg-blue-800 flex min-w-[100px] whitespace-nowrap items-center justify-center"
                      >
                        {phoneAuthCodeSent
                          ? "인증"
                          : isPhoneLoading
                          ? "로딩중..."
                          : "인증번호 받기"}
                      </button>
                    </div>
                    {phoneAuthCodeSent && (
                      <p className="text-xs text-gray-500 mt-1">
                        남은 시간: {Math.floor(phoneTimer / 60)}:
                        {String(phoneTimer % 60).padStart(2, "0")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <div className="mb-9">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                  placeholder="비밀번호를 다시 입력하세요"
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
      </div>
    </div>
  );
}
