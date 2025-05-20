"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phoneNumber: "",
    managementPage: "",
    department: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [phoneVerification, setPhoneVerification] = useState({
    sent: false,
    verified: false,
    code: "",
    inputCode: "",
  });
  const [emailVerification, setEmailVerification] = useState({
    sent: false,
    verified: false,
    code: "",
    inputCode: "",
  });
  const [signupType, setSignupType] = useState<"manager" | "regular" | null>(null);
  const [hasManagementPage, setHasManagementPage] = useState<boolean | null>(null);
  const [step, setStep] = useState<"select" | "managementSelect" | "signup" | "success">("select");
  const [signupData, setSignupData] = useState<any>(null);

  useEffect(() => {
    // URL 파라미터에서 success=true 확인
    const successParam = searchParams.get('success');
    if (successParam === 'true') {
      // 테스트용 데이터 설정
      setSignupType("manager");
      setHasManagementPage(false);
      setSignupData({
        id: 12345,
        email: "test@example.com",
        name: "테스트 사용자",
        phoneNumber: "010-1234-5678",
        managementPage: "",
        department: "",
        userType: "manager",
        hasManagementPage: false
      });
      setStep("success");
    }
  }, [searchParams]);

  const handleTypeSelect = (type: "manager" | "regular") => {
    setSignupType(type);
    if (type === "manager") {
      setStep("managementSelect");
    } else {
      setStep("signup");
    }
  };

  const handleManagementSelect = (has: boolean) => {
    setHasManagementPage(has);
    setStep("signup");
    
    // 관리페이지 없음 선택 시 managementPage 필드와 department 필드 초기화
    if (!has) {
      setFormData((prev) => ({ ...prev, managementPage: "", department: "" }));
    }
  };

  const handleBackToSelection = () => {
    setStep("select");
    setSignupType(null);
    setHasManagementPage(null);
  };

  const handleBackToManagementSelect = () => {
    setStep("managementSelect");
    setHasManagementPage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // 실시간 오류 검사
    if (name === "confirmPassword" && formData.password !== value) {
      setErrors((prev) => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
    } else if (name === "confirmPassword") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'phone' | 'email') => {
    if (type === 'phone') {
      setPhoneVerification(prev => ({
        ...prev,
        inputCode: e.target.value
      }));
    } else {
      setEmailVerification(prev => ({
        ...prev,
        inputCode: e.target.value
      }));
    }
  };

  const sendEmailVerificationCode = () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: "이메일을 입력해주세요." }));
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: "유효한 이메일 형식이 아닙니다." }));
      return;
    }

    // 실제 구현에서는 API 호출이 필요합니다.
    // 지금은 임시로 랜덤 코드를 생성합니다.
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setEmailVerification(prev => ({
      ...prev,
      sent: true,
      code: verificationCode
    }));
    
    // 실제 구현에서는 아래 코드 대신 API 호출이 필요합니다.
    alert(`이메일로 인증번호가 발송되었습니다: ${verificationCode}`);
  };

  const verifyEmailCode = () => {
    if (emailVerification.inputCode === emailVerification.code) {
      setEmailVerification(prev => ({
        ...prev,
        verified: true
      }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.emailVerification;
        return newErrors;
      });
    } else {
      setErrors(prev => ({ ...prev, emailVerification: "인증번호가 일치하지 않습니다." }));
    }
  };

  const sendVerificationCode = () => {
    if (!formData.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: "전화번호를 입력해주세요." }));
      return;
    }

    if (!/^\d{3}-\d{3,4}-\d{4}$/.test(formData.phoneNumber)) {
      setErrors(prev => ({ ...prev, phoneNumber: "유효한 전화번호 형식이 아닙니다. (예: 010-1234-5678)" }));
      return;
    }

    // 실제 구현에서는 API 호출이 필요합니다.
    // 지금은 임시로 랜덤 코드를 생성합니다.
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPhoneVerification(prev => ({
      ...prev,
      sent: true,
      code: verificationCode
    }));
    
    // 실제 구현에서는 아래 코드 대신 API 호출이 필요합니다.
    alert(`휴대폰으로 인증번호가 발송되었습니다: ${verificationCode}`);
  };

  const verifyCode = () => {
    if (phoneVerification.inputCode === phoneVerification.code) {
      setPhoneVerification(prev => ({
        ...prev,
        verified: true
      }));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phoneVerification;
        return newErrors;
      });
    } else {
      setErrors(prev => ({ ...prev, phoneVerification: "인증번호가 일치하지 않습니다." }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupType) {
      newErrors.userType = "회원 유형을 선택해주세요.";
      return false;
    }
    
    if (signupType === "manager" && hasManagementPage === null) {
      newErrors.managementPageStatus = "조직 관리 페이지 상태를 선택해주세요.";
      return false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "유효한 이메일 형식이 아닙니다.";
    }
    
    if (!emailVerification.verified) {
      newErrors.emailVerification = "이메일 인증이 필요합니다.";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }
    
    if (signupType === "manager" && hasManagementPage && !formData.managementPage.trim()) {
      newErrors.managementPage = "참여할 조직 관리 페이지 이름을 입력해주세요.";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "전화번호를 입력해주세요.";
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "유효한 전화번호 형식이 아닙니다. (예: 010-1234-5678)";
    }
    
    if (!phoneVerification.verified) {
      newErrors.phoneVerification = "휴대폰 번호 인증이 필요합니다.";
    }
    
    if (signupType === "regular" && !formData.managementPage.trim()) {
      newErrors.managementPage = "소속될 조직 관리 페이지 이름을 입력해주세요.";
    }
    
    if (signupType === "regular" && !formData.department.trim()) {
      newErrors.department = "부서를 입력해주세요.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        managementPage: hasManagementPage ? formData.managementPage : "",
        department: formData.department,
        userType: signupType,
        hasManagementPage: signupType === "manager" ? hasManagementPage : null,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 모든 회원가입 케이스에서 성공 화면으로 이동
        setSignupData({
          ...requestData,
          id: data.data?.id || ""
        });
        setStep("success");
      } else {
        // 서버에서 오는 에러 메시지 처리
        setErrors((prev) => ({ ...prev, submit: data.message || "회원가입 중 오류가 발생했습니다." }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: "서버 연결 중 오류가 발생했습니다." }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManagementPage = () => {
    router.push('/admin/request');  // 관리자 페이지 생성 페이지로 이동
  };

  return (
    <div className="min-h-screen h-screen bg-white flex overflow-hidden">
      <div className="w-1/5 h-screen"></div>
      
      <div className="w-1/4 h-screen flex flex-col justify-center -ml-12">
        <div className="pl-0">
          <Link href="/">
            <img src="/logo.png" alt="Juseyo 로고" className="h-36 mb-6 rounded-xl shadow-md" />
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-[#0047AB]">
            {step === "success" ? "회원가입 완료" : "회원 가입"}
          </h1>
          <p className="text-lg mb-2 text-gray-600">
            {step === "success" 
              ? signupType === "manager" && hasManagementPage === false
                ? "매니저 계정 등록이 완료되었습니다!"
                : "회원가입이 완료되었습니다!"
              : "재고 관리 플랫폼 Juseyo에 오신 것을 환영합니다."}
          </p>
          <p className="text-base text-gray-500 mb-4">
            {step === "success" 
              ? signupType === "manager" && hasManagementPage === false
                ? "기능을 사용하려면 관리자 페이지를 생성해주세요."
                : "로그인하여 서비스를 이용해보세요."
              : "업무용 계정을 생성하여 재고를 효율적으로 관리하세요."}
          </p>
        </div>
      </div>
      
      <div className="w-2/4 h-screen flex items-center pl-12 pr-12 overflow-hidden">
        <div className="w-full">
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-base">
              {errors.submit}
            </div>
          )}
          
          {step === "select" ? (
            <div className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
              <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
                <h2 className="text-2xl font-bold">회원 유형 선택</h2>
                <p className="text-base mt-2 opacity-80">어떤 유형의 계정으로 가입하시겠습니까?</p>
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
                  <h2 className="text-xl font-bold text-[#0047AB] mb-2">매니저 계정</h2>
                  <p className="text-base text-gray-500 text-center whitespace-nowrap">재고 및 사용자 관리를 위한 권한</p>
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
                  <h2 className="text-xl font-bold text-[#0047AB] mb-2">일반 회원</h2>
                  <p className="text-base text-gray-500 text-center whitespace-nowrap">재고 조회 및 요청을 위한 접근</p>
                  <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 text-center">
                <Link href="/" className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          ) : step === "managementSelect" ? (
            <div className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
              <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
                <h2 className="text-2xl font-bold">조직 관리 페이지 설정</h2>
                <p className="text-base mt-2 opacity-80">현재 조직의 관리 페이지 상태를 선택해주세요.</p>
              </div>
              
              <div className="bg-white p-8 grid grid-cols-2 gap-6">
                <button 
                  className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
                  onClick={() => handleManagementSelect(true)}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0047AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#0047AB] mb-2">관리 페이지 있음</h2>
                  <p className="text-base text-gray-500 text-center">이미 조직에 관리 페이지가 있습니다.</p>
                  <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
                
                <button 
                  className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
                  onClick={() => handleManagementSelect(false)}
                >
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#0047AB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#0047AB] mb-2">관리 페이지 없음</h2>
                  <p className="text-base text-gray-500 text-center">새로운 관리 페이지를 생성합니다.</p>
                  <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 text-center">
                <button
                  onClick={handleBackToSelection}
                  className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  회원 유형 선택으로 돌아가기
                </button>
              </div>
            </div>
          ) : step === "success" ? (
            <div className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
              <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
                <h2 className="text-2xl font-bold">회원가입 완료</h2>
                <p className="text-base mt-2 opacity-80">
                  {signupType === "manager" && hasManagementPage === false 
                    ? "관리자 페이지 생성이 필요합니다" 
                    : "가입해주셔서 감사합니다"}
                </p>
              </div>
              
              <div className="bg-white p-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">가입이 완료되었습니다!</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                  <span className="font-semibold text-[#0047AB]">{signupData?.name}</span>님, 
                  {signupType === "manager" 
                    ? " 매니저 계정 등록이 성공적으로 완료되었습니다." 
                    : " 일반 회원 등록이 성공적으로 완료되었습니다."}
                  {signupType === "manager" && hasManagementPage === false 
                    ? " 재고 관리 기능을 이용하려면 관리자 페이지를 생성해야 합니다."
                    : ""}
                </p>
                
                <div className="flex flex-col gap-4 w-full max-w-sm">
                  {signupType === "manager" && hasManagementPage === false && (
                    <button
                      onClick={handleCreateManagementPage}
                      className="flex items-center justify-center py-3 px-6 bg-[#0047AB] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-base gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      관리자 페이지 생성하기
                    </button>
                  )}
                  
                  <Link href="/login" className={`flex items-center justify-center py-3 px-6 ${signupType === "manager" && hasManagementPage === false ? "border border-[#0047AB] text-[#0047AB]" : "bg-[#0047AB] text-white"} rounded-lg font-medium hover:${signupType === "manager" && hasManagementPage === false ? "bg-blue-50" : "bg-blue-800"} transition-colors text-base gap-2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    로그인 페이지로 이동
                  </Link>
                  
                  <Link href="/" className="flex items-center justify-center py-3 px-6 border border-[#0047AB] text-[#0047AB] rounded-lg font-medium hover:bg-blue-50 transition-colors text-base gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    홈으로 이동
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-1.5 w-full shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-white px-8 py-5 border-b border-gray-200">
                <button 
                  type="button" 
                  onClick={signupType === "manager" ? handleBackToManagementSelect : handleBackToSelection}
                  className="text-gray-500 hover:text-[#0047AB] transition-colors flex items-center mb-4 text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  {signupType === "manager" ? "조직 관리 페이지 선택으로 돌아가기" : "회원 유형 선택으로 돌아가기"}
                </button>
                <h2 className="text-2xl font-bold text-[#0047AB] mb-2">
                  {signupType === "manager" ? "매니저 계정 가입" : "일반 회원 가입"}
                </h2>
                <p className="text-base text-gray-600">
                  {signupType === "manager" 
                    ? hasManagementPage 
                      ? "기존 조직 관리 페이지에 매니저로 가입합니다." 
                      : "새로운 조직 관리 페이지를 생성합니다."
                    : "일반 회원으로 가입하여 재고를 효율적으로 관리하세요."}
                </p>
              </div>
              
              <div className="bg-white px-8 py-5">
                <div className="space-y-1.5">
                  <div className="text-lg font-medium text-[#0047AB] mb-1.5 pb-1.5 border-b border-gray-200">계정 정보</div>
                  
                  <div className="mb-2.5">
                    <label className="block text-base font-medium text-gray-700 mb-1.5">이메일 <span className="text-red-500">*</span></label>
                    <div className="flex mb-1.5">
                      <input
                        className={`flex-grow px-3 py-2.5 border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                        type="email"
                        name="email"
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={emailVerification.verified}
                      />
                      {!emailVerification.verified && (
                        <button
                          type="button"
                          className={`ml-2 px-4 py-2.5 rounded-lg whitespace-nowrap text-base ${emailVerification.verified 
                            ? 'bg-green-500 text-white' 
                            : 'bg-[#0047AB] text-white'}`}
                          onClick={sendEmailVerificationCode}
                          disabled={emailVerification.verified}
                        >
                          {emailVerification.sent ? '재전송' : '인증번호 받기'}
                        </button>
                      )}
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-0.5">{errors.email}</p>}
                  </div>

                  {emailVerification.sent && !emailVerification.verified && (
                    <div className="mb-2.5">
                      <label className="block text-base font-medium text-gray-700 mb-1.5">이메일 인증번호 <span className="text-red-500">*</span></label>
                      <div className="flex">
                        <input
                          className={`flex-grow px-3 py-2.5 border-2 ${errors.emailVerification ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                          type="text"
                          placeholder="인증번호 6자리 입력"
                          value={emailVerification.inputCode}
                          onChange={(e) => handleVerificationCodeChange(e, 'email')}
                        />
                        <button
                          type="button"
                          className="ml-2 bg-[#0047AB] text-white px-4 py-2.5 rounded-lg whitespace-nowrap text-base"
                          onClick={verifyEmailCode}
                        >
                          확인
                        </button>
                      </div>
                      {errors.emailVerification && <p className="text-red-500 text-sm mt-0.5">{errors.emailVerification}</p>}
                      {emailVerification.verified && <p className="text-green-500 text-sm mt-0.5">인증되었습니다.</p>}
                    </div>
                  )}
                  
                  <div className="mb-2.5">
                    <label className="block text-base font-medium text-gray-700 mb-1.5">이름 <span className="text-red-500">*</span></label>
                    <input
                      className={`w-full px-3 py-2.5 border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                      type="text"
                      name="name"
                      placeholder="이름 입력"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-0.5">{errors.name}</p>}
                  </div>

                  {signupType === "manager" && hasManagementPage && (
                    <div className="mb-2.5">
                      <label className="block text-base font-medium text-gray-700 mb-1.5">조직 관리 페이지 이름 <span className="text-red-500">*</span></label>
                      <input
                        className={`w-full px-3 py-2.5 border-2 ${errors.managementPage ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                        type="text"
                        name="managementPage"
                        placeholder="참여할 조직 관리 페이지 이름을 입력해주세요"
                        value={formData.managementPage}
                        onChange={handleChange}
                      />
                      {errors.managementPage && <p className="text-red-500 text-sm mt-0.5">{errors.managementPage}</p>}
                    </div>
                  )}
                  
                  <div className="mb-2.5">
                    <label className="block text-base font-medium text-gray-700 mb-1.5">비밀번호 <span className="text-red-500">*</span></label>
                    <input
                      className={`w-full px-3 py-2.5 border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                      type="password"
                      name="password"
                      placeholder="비밀번호 입력"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">영문, 숫자, 특수문자 조합 8자 이상</p>
                    {errors.password && <p className="text-red-500 text-sm mt-0.5">{errors.password}</p>}
                  </div>
                  
                  <div className="mb-2.5">
                    <label className="block text-base font-medium text-gray-700 mb-1.5">비밀번호 확인 <span className="text-red-500">*</span></label>
                    <input
                      className={`w-full px-3 py-2.5 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                      type="password"
                      name="confirmPassword"
                      placeholder="비밀번호 확인"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-0.5">{errors.confirmPassword}</p>}
                  </div>

                  <div className="mb-2.5">
                    <label className="block text-base font-medium text-gray-700 mb-1.5">휴대폰 번호 <span className="text-red-500">*</span></label>
                    <div className="flex mb-1.5">
                      <input
                        className={`flex-grow px-3 py-2.5 border-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                        type="text"
                        name="phoneNumber"
                        placeholder="예: 010-1234-5678"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={phoneVerification.verified}
                      />
                      {!phoneVerification.verified && (
                        <button
                          type="button"
                          className={`ml-2 px-4 py-2.5 rounded-lg whitespace-nowrap text-base ${phoneVerification.verified 
                            ? 'bg-green-500 text-white' 
                            : 'bg-[#0047AB] text-white'}`}
                          onClick={sendVerificationCode}
                          disabled={phoneVerification.verified}
                        >
                          {phoneVerification.sent ? '재전송' : '인증번호 받기'}
                        </button>
                      )}
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-0.5">{errors.phoneNumber}</p>}
                  </div>

                  {phoneVerification.sent && !phoneVerification.verified && (
                    <div className="mb-2.5">
                      <label className="block text-base font-medium text-gray-700 mb-1.5">휴대폰 인증번호 <span className="text-red-500">*</span></label>
                      <div className="flex">
                        <input
                          className={`flex-grow px-3 py-2.5 border-2 ${errors.phoneVerification ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                          type="text"
                          placeholder="인증번호 6자리 입력"
                          value={phoneVerification.inputCode}
                          onChange={(e) => handleVerificationCodeChange(e, 'phone')}
                        />
                        <button
                          type="button"
                          className="ml-2 bg-[#0047AB] text-white px-4 py-2.5 rounded-lg whitespace-nowrap text-base"
                          onClick={verifyCode}
                        >
                          확인
                        </button>
                      </div>
                      {errors.phoneVerification && <p className="text-red-500 text-sm mt-0.5">{errors.phoneVerification}</p>}
                      {phoneVerification.verified && <p className="text-green-500 text-sm mt-0.5">인증되었습니다.</p>}
                    </div>
                  )}
                  
                  {(signupType === "regular") && (
                    <>
                      <div className="text-lg font-medium text-[#0047AB] mt-3 mb-1.5 pb-1.5 border-b border-gray-200">업무 정보</div>
                      
                      <div className="mb-2.5">
                        <label className="block text-base font-medium text-gray-700 mb-1.5">조직 관리 페이지 이름 <span className="text-red-500">*</span></label>
                        <input
                          className={`w-full px-3 py-2.5 border-2 ${errors.managementPage ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                          type="text"
                          name="managementPage"
                          placeholder="소속될 조직 관리 페이지 이름을 입력해주세요"
                          value={formData.managementPage}
                          onChange={handleChange}
                        />
                        {errors.managementPage && <p className="text-red-500 text-sm mt-0.5">{errors.managementPage}</p>}
                      </div>
                      
                      <div className="mb-2">
                        <label className="block text-base font-medium text-gray-700 mb-1.5">부서 선택 <span className="text-red-500">*</span></label>
                        <input
                          className={`w-full px-3 py-2.5 border-2 ${errors.department ? 'border-red-500' : 'border-gray-200'} rounded-lg bg-white text-gray-800 text-base`}
                          type="text"
                          name="department"
                          placeholder="부서를 입력해주세요"
                          value={formData.department}
                          onChange={handleChange}
                        />
                        {errors.department && <p className="text-red-500 text-sm mt-0.5">{errors.department}</p>}
                      </div>
                    </>
                  )}
                  
                  <div className="text-sm text-gray-500 mt-1.5">
                    <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다.
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-[#0047AB] text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors mt-6 mb-4 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? '처리 중...' : '회원가입 하기'}
                  </button>
                  
                  <div className="bg-gray-50 px-8 py-4 text-center -mx-8 -mb-5 mt-3 border-t border-gray-200">
                    <div className="flex justify-center space-x-6">
                      <Link href="/" className="flex items-center justify-center px-5 py-1.5 border border-[#0047AB] text-[#0047AB] rounded-lg font-medium hover:bg-blue-50 transition-colors text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        홈으로
                      </Link>
                      <Link href="/login" className="flex items-center justify-center px-5 py-1.5 bg-[#0047AB] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        로그인하기
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 