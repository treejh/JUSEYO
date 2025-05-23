"use client";

import { useState } from "react";
import Link from "next/link";
import {
  checkPhoneDuplication,
  sendPhoneAuthCode,
  verifyPhoneAuthCode,
} from "@/utils/phoneValidation";

export default function FindEmailPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneAuthCode, setPhoneAuthCode] = useState("");
  const [phoneAuthCodeSent, setPhoneAuthCodeSent] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(180); // 3분 타이머
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneDuplicate, setIsPhoneDuplicate] = useState<boolean | null>(
    null
  ); // 핸드폰 번호 중복 여부

  // 핸드폰 번호 중복 확인
  const handleCheckPhoneDuplication = async () => {
    setError("");
    if (!/^010-\d{4}-\d{4}$/.test(phoneNumber)) {
      setError("유효한 핸드폰 번호 형식을 입력해주세요. (예: 010-1234-5678)");
      return;
    }

    try {
      setIsLoading(true);
      const isDuplicate = await checkPhoneDuplication(phoneNumber);
      setIsPhoneDuplicate(isDuplicate);

      if (!isDuplicate) {
        setError("존재하지 않는 핸드폰 번호입니다.");
      }
    } catch (error) {
      setError("핸드폰 번호 확인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 요청
  const handleSendPhoneAuthCode = async () => {
    setError("");

    try {
      setIsLoading(true);
      const success = await sendPhoneAuthCode(phoneNumber);

      if (success) {
        setPhoneAuthCodeSent(true);
        setPhoneTimer(180); // 타이머 초기화
        startTimer();
      } else {
        setError("인증번호 전송에 실패했습니다.");
      }
    } catch (error) {
      setError("인증번호 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const handleVerifyPhoneAuthCode = async () => {
    setError("");
    if (!phoneAuthCode.trim()) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const success = await verifyPhoneAuthCode(phoneNumber, phoneAuthCode);

      if (success) {
        setIsPhoneVerified(true);
      } else {
        setError("인증번호 확인에 실패했습니다.");
      }
    } catch (error) {
      setError("인증번호 확인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 타이머 시작
  const startTimer = () => {
    const timer = setInterval(() => {
      setPhoneTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhoneAuthCodeSent(false); // 타이머 종료 시 인증번호 입력 비활성화
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmail("");

    if (!isPhoneVerified) {
      setError("전화번호 인증이 완료되지 않았습니다.");
      return;
    }

    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_URL}/api/v1/users/find-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error("이메일 찾기에 실패했습니다.");
      }

      const data = await response.json();
      setEmail(data.email);
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
          <h2 className="text-3xl font-bold text-[#0047AB]">이메일 찾기</h2>
          <p className="text-gray-500 mt-2 text-sm">
            전화번호를 입력하고 인증을 완료하면 이메일을 찾을 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-300 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {email && (
          <div className="bg-green-50 text-green-700 border border-green-300 px-4 py-2 rounded-lg text-sm">
            찾은 이메일: <strong>{email}</strong>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            핸드폰 번호
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="예: 010-1234-5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCheckPhoneDuplication}
            className="w-full mt-2 py-2 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "확인 중..." : "핸드폰 번호 확인"}
          </button>
        </div>

        {isPhoneDuplicate === false && (
          <div className="bg-red-50 text-red-600 border border-red-300 px-4 py-2 rounded-lg text-sm mt-4">
            존재하지 않는 핸드폰 번호입니다.
          </div>
        )}

        {isPhoneDuplicate && (
          <>
            {phoneAuthCodeSent && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인증번호 입력
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={phoneAuthCode}
                    onChange={(e) => setPhoneAuthCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0047AB] focus:outline-none"
                    placeholder="인증번호를 입력하세요"
                    disabled={phoneTimer === 0}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneAuthCode}
                    className="ml-3 px-3 py-3 rounded-lg text-white text-sm bg-[#0047AB] hover:bg-blue-800 flex min-w-[100px] whitespace-nowrap items-center justify-center"
                    disabled={isLoading}
                  >
                    인증
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  남은 시간: {Math.floor(phoneTimer / 60)}:
                  {String(phoneTimer % 60).padStart(2, "0")}
                </p>
              </div>
            )}

            {!isPhoneVerified && (
              <button
                type="button"
                onClick={handleSendPhoneAuthCode}
                className="w-full py-3 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-60"
                disabled={isLoading || phoneAuthCodeSent}
              >
                {isLoading ? "전송 중..." : "인증번호 받기"}
              </button>
            )}
          </>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-60"
          disabled={isLoading || !isPhoneVerified}
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
