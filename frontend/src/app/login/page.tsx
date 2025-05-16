"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginUser } from "@/stores/auth/loginMember";

export default function LoginPage() {
  const router = useRouter();
  const { setLoginUser } = useLoginUser();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"manager" | "regular" | null>(null);
  const [step, setStep] = useState<"select" | "login" | "success">("select");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: "manager" | "regular") => {
    setLoginType(type);
    setStep("login");
  };

  const handleBackToSelection = () => {
    setStep("select");
    setLoginType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (!loginType) {
      setError("로그인 유형을 선택해주세요.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // API URL 가져오기
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      if (!API_URL) {
        throw new Error('API URL이 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
      }
      
      // API 호출
      const response = await fetch(`${API_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      // 응답 타입 확인
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || '로그인에 실패했습니다.');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || '로그인 처리 중 오류가 발생했습니다.');
        }
      }
      
      // 로그인 성공 후 사용자 정보 가져오기
      const userInfoResponse = await fetch(`${API_URL}/api/v1/users/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!userInfoResponse.ok) {
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }
      
      const userData = await userInfoResponse.json();
      
      // 로그인 유형 확인 (경고만 표시하고 계속 진행)
      const isManagerRole = userData.role === "MANAGER" || userData.role === "ADMIN";
      const isUserRole = userData.role === "USER";
      
      if ((loginType === "manager" && !isManagerRole) || 
          (loginType === "regular" && !isUserRole)) {
        console.warn("선택한 로그인 유형이 계정 권한과 일치하지 않습니다.");
        // 경고 표시만 하고 계속 진행 (return 제거)
      }
      
      // 로그인 성공 처리
      setLoginUser(userData);
      
      // 로그인 성공 시 대시보드 페이지로 바로 이동
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("서버 연결 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToHome = () => {
    router.push("/");
  };

  const handleGoToSignup = () => {
    // 회원가입 페이지로 이동하는 대신 회원가입 성공 페이지로 이동
    router.push("/signup?success=true");
  };

  return (
    <div className="w-screen h-screen bg-white flex overflow-hidden">
      <div className="w-1/5 h-full flex-shrink-0"></div>
      
      <div className="w-1/4 h-full flex-shrink-0 flex flex-col justify-center -ml-12">
        <div className="pl-0">
          <Link href="/">
            <img src="/logo.png" alt="Juseyo 로고" className="h-40 mb-8 rounded-xl shadow-md" />
          </Link>
          <h1 className="text-3xl font-bold mb-3 text-[#0047AB]">
            {step === "success" ? "로그인 성공" : "로그인"}
          </h1>
          <p className="text-lg mb-2 text-gray-600">재고 관리 플랫폼 Juseyo에 오신 것을 환영합니다.</p>
          <p className="text-base text-gray-500 mb-6">
            {step === "success" 
              ? "서비스를 이용하실 수 있습니다." 
              : "계정에 로그인하여 재고를 효율적으로 관리하세요."}
          </p>
        </div>
      </div>
      
      <div className="w-2/4 h-full flex-shrink-0 flex items-center pl-16 pr-16 overflow-hidden">
        <div className="w-3/4 ml-20">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-base">
              {error}
            </div>
          )}

          {step === "select" ? (
            <div className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
              <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
                <h2 className="text-2xl font-bold">로그인 유형 선택</h2>
                <p className="text-base mt-2 opacity-80">어떤 계정으로 로그인하시겠습니까?</p>
              </div>
              
              <div className="bg-white p-8 grid grid-cols-2 gap-6">
                <button 
                  className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
                  onClick={() => handleTypeSelect("manager")}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0047AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#0047AB] mb-2">매니저 로그인</h2>
                  <p className="text-base text-gray-500 text-center whitespace-nowrap">재고 및 사용자 관리를 위한 접근</p>
                  <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
                
                <button 
                  className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
                  onClick={() => handleTypeSelect("regular")}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0047AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#0047AB] mb-2">일반 회원 로그인</h2>
                  <p className="text-base text-gray-500 text-center whitespace-nowrap">재고 조회 및 요청을 위한 접근</p>
                  <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 text-center">
                <div className="flex justify-center space-x-6">
                  <Link href="/" className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    홈으로 돌아가기
                  </Link>
                  <button 
                    onClick={() => router.push("/signup")}
                    className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    회원가입 하기
                  </button>
                </div>
              </div>
            </div>
          ) : step === "success" ? (
            <div className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
              <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
                <h2 className="text-2xl font-bold">로그인 성공</h2>
                <p className="text-base mt-2 opacity-80">환영합니다, 서비스를 이용하실 수 있습니다.</p>
              </div>
              
              <div className="bg-white p-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">로그인이 완료되었습니다!</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                  <span className="font-semibold text-[#0047AB]">{loginType === "manager" ? "관리자" : "일반 사용자"}</span>님, 
                  {loginType === "manager" 
                    ? " 매니저 권한으로 로그인되었습니다." 
                    : " 일반 회원으로 로그인되었습니다."}
                </p>
                
                <div className="flex flex-col gap-4 w-full max-w-sm">
                  <button
                    onClick={handleGoToHome}
                    className="flex items-center justify-center py-3 px-6 bg-[#0047AB] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-base gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    홈페이지로 이동
                  </button>
                  
                  <Link href="/dashboard" className="flex items-center justify-center py-3 px-6 border border-[#0047AB] text-[#0047AB] rounded-lg font-medium hover:bg-blue-50 transition-colors text-base gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    대시보드로 이동
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
              <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
                <h2 className="text-2xl font-bold">{loginType === "manager" ? "매니저 로그인" : "일반 회원 로그인"}</h2>
                <p className="text-base mt-2 opacity-80">계정 정보를 입력하여 로그인하세요.</p>
              </div>
              
              <div className="bg-white px-8 py-8">
                <button 
                  type="button" 
                  onClick={handleBackToSelection}
                  className="text-gray-500 hover:text-[#0047AB] transition-colors flex items-center mb-6 text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  유형 선택으로 돌아가기
                </button>
                
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                      {loginType === "manager" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0047AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0047AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-base font-medium text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-[#0047AB] focus:outline-none transition-colors text-gray-800 text-base"
                      id="email"
                      type="email"
                      name="email"
                      placeholder="이메일"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-base font-medium text-gray-700 mb-2">비밀번호 <span className="text-red-500">*</span></label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-[#0047AB] focus:outline-none transition-colors text-gray-800 text-base"
                      id="password"
                      type="password"
                      name="password"
                      placeholder="비밀번호"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-[#0047AB] focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-base text-gray-700">
                        로그인 상태 유지
                      </label>
                    </div>
                    <div className="text-base">
                      <a href="#" className="text-[#0047AB] hover:underline">
                        비밀번호를 잊으셨나요?
                      </a>
                    </div>
                  </div>
                  
                  <button
                    className="w-full bg-[#0047AB] text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors text-base"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? '로그인 중...' : '로그인'}
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
                <div className="flex justify-center space-x-6">
                  <Link href="/" className="flex items-center justify-center px-6 py-2 border border-[#0047AB] text-[#0047AB] rounded-lg font-medium hover:bg-blue-50 transition-colors text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    홈으로
                  </Link>
                  <button 
                    type="button"
                    onClick={() => router.push("/signup")}
                    className="flex items-center justify-center px-6 py-2 bg-[#0047AB] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    회원가입하기
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 