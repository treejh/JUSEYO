'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginUser } from "@/types/auth";
import { useLoginUser } from "@/stores/auth/loginMember";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface BizCheckResponse {
  request_cnt: number;
  status_code: string;
  data: Array<{
    b_no: string;
    b_stt: string;
    b_stt_cd: string;
    tax_type: string;
    tax_type_cd: string;
    end_dt: string;
    utcc_yn: string;
    tax_type_change_dt: string;
    invoice_apply_dt: string;
    rbf_tax_type: string;
    rbf_tax_type_cd: string;
  }>;
}

export default function AdminRequest() {
  const router = useRouter();
  const { isLogin, loginUser } = useLoginUser();
  const [formData, setFormData] = useState({
    pageName: '',
    owner: '',
    companyName: '',
    businessNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // 1: 기본 정보, 2: 사업자 정보

   useEffect(() => {
     if (!isLogin || !loginUser) {
       alert('로그인이 필요한 서비스입니다.');
       router.push('/login');
       return;
     }

     if (loginUser.role !== 'ADMIN') {
       if (loginUser.managementDashboardName) {
         alert('이미 관리자 페이지가 존재합니다.');
         router.push('/');
         return;
       }

       if (loginUser.role !== 'MANAGER') {
         alert('관리자 페이지 생성 권한이 없습니다.');
         router.push('/');
         return;
       }
     }
   }, [isLogin, loginUser, router]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pageName.trim()) {
      newErrors.pageName = '페이지 이름을 입력해주세요';
    }
    if (!formData.owner.trim()) {
      newErrors.owner = '대표자 성명을 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = '회사명을 입력해주세요';
    }
    if (!formData.businessNumber.trim()) {
      newErrors.businessNumber = '사업자 등록번호를 입력해주세요';
    } else if (!/^\d{10}$/.test(formData.businessNumber)) {
      newErrors.businessNumber = '사업자 등록번호는 숫자 10자리여야 합니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const checkBusinessNumber = async (bno: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/biz/check?bno=${bno}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('사업자 등록번호 검증에 실패했습니다');
      }

      const result: BizCheckResponse = await response.json();
      
      const bizInfo = result.data[0];
      
      if (bizInfo.tax_type.includes('국세청에 등록되지 않은')) {
        throw new Error('국세청에 등록되지 않은 사업자등록번호입니다');
      }

      return true;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('사업자 등록번호 검증에 실패했습니다');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await checkBusinessNumber(formData.businessNumber);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/management`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('관리 페이지 등록에 실패했습니다');
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        if (loginUser) {
          const updatedUser = {
            ...loginUser,
            managementDashboardName: formData.pageName,
          };
          localStorage.setItem('loginUser', JSON.stringify(updatedUser));
        }
        
        alert('관리자 페이지가 성공적으로 생성되었습니다');
        router.push('/settings/departments');
      } else {
        setErrors({ submit: result.message || '관리 페이지 등록에 실패했습니다' });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || '요청 처리 중 오류가 발생했습니다' });
    } finally {
      setIsLoading(false);
    }
   };

  if (!loginUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">관리자 페이지 생성</h2>
            <p className="text-blue-100 mt-1">
              {step === 1 ? '기본 정보 입력' : '사업자 정보 입력'}
            </p>
          </div>

          {/* 진행 상태 표시 */}
          <div className="px-8 pt-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <div className={`h-1 w-24 mx-2 ${
                  step > 1 ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {step === 1 ? (
              // 스텝 1: 기본 정보
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    페이지 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pageName"
                    value={formData.pageName}
                    onChange={handleChange}
                    placeholder="예: ABC주식회사 관리 페이지"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.pageName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isLoading}
                  />
                  {errors.pageName && (
                    <p className="mt-1 text-sm text-red-500">{errors.pageName}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표자 성명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    placeholder="예: 홍길동"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.owner ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isLoading}
                  />
                  {errors.owner && (
                    <p className="mt-1 text-sm text-red-500">{errors.owner}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    다음 단계
                  </button>
                </div>
              </>
            ) : (
              // 스텝 2: 사업자 정보
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="예: ABC주식회사"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isLoading}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자 등록번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleChange}
                    placeholder="하이픈(-) 없이 숫자 10자리"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.businessNumber ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    disabled={isLoading}
                  />
                  {errors.businessNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.businessNumber}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    • 하이픈(-) 없이 숫자 10자리를 입력해주세요
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    이전 단계
                  </button>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          처리중...
                        </>
                      ) : (
                        '완료'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 