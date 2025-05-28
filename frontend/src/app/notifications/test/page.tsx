"use client";

import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCustomToast } from "@/utils/toast";

export default function NotificationTestPage() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const router = useRouter();
  const toast = useCustomToast();

  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
    }
  }, [isLogin, router]);

  // 재고 부족 알림 테스트 핸들러
  const handleStockAlertTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/stockDown`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("재고 부족 알림 테스트가 실행되었습니다.");
      } else {
        toast.error("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // 비품 요청 테스트 핸들러
  const handleSupplyRequestTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/newSupplyRequest`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("비품 요청 알림 테스트가 실행되었습니다.");
      } else {
        toast.error("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // 비품 반납 테스트 핸들러
  const handleSupplyReturnTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/newSupplyReturn`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("비품 반납 알림 테스트가 실행되었습니다.");
      } else {
        toast.error("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // 비품 요청 승인 테스트 핸들러
  const handleSupplyRequestApprovedTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/supplyRequestApproved`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("비품 요청 승인 알림 테스트가 실행되었습니다.");
      } else {
        toast.error("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // 비품 요청 반려 테스트 핸들러
  const handleSupplyRequestRejectedTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/supplyRequestRejected`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        toast.success("비품 요청 반려 알림 테스트가 실행되었습니다.");
      } else {
        toast.error("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // 비품 반납 승인 테스트 핸들러
  const handleSupplyReturnApprovedTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/supplyReturnApproved`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        alert("비품 반납 승인 알림 테스트가 실행되었습니다.");
      } else {
        alert("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // 대시보드 승인 테스트 핸들러
  const handleDashboardApprovedTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/newDashboardApproved`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        alert("대시보드 승인 알림 테스트가 실행되었습니다.");
      } else {
        alert("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  // Add new handler for manager approval test
  const handleManagerApprovedTest = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/newManagerApproved`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        alert("매니저 승인 알림 테스트가 실행되었습니다.");
      } else {
        alert("알림 테스트 실행에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("알림 테스트 실행 중 오류가 발생했습니다.");
    }
  };

  if (!isLogin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">알림 테스트</h1>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                재고 부족 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                재고가 부족한 경우 발생하는 알림을 테스트합니다.
              </p>
              <button
                onClick={handleStockAlertTest}
                className="px-6 py-3 bg-white border border-indigo-300 text-indigo-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                재고 부족 알림 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                비품 요청 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                새로운 비품 요청이 발생했을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleSupplyRequestTest}
                className="px-6 py-3 bg-white border border-indigo-300 text-indigo-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                비품 요청 알림 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                비품 반납 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                새로운 비품 반납이 발생했을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleSupplyReturnTest}
                className="px-6 py-3 bg-white border border-indigo-300 text-indigo-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                비품 반납 알림 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                비품 요청 승인 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                비품 요청이 승인되었을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleSupplyRequestApprovedTest}
                className="px-6 py-3 bg-white border border-green-300 text-green-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                비품 요청 승인 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                비품 요청 반려 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                비품 요청이 반려되었을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleSupplyRequestRejectedTest}
                className="px-6 py-3 bg-white border border-red-300 text-red-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                비품 요청 반려 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                비품 반납 승인 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                비품 반납이 승인되었을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleSupplyReturnApprovedTest}
                className="px-6 py-3 bg-white border border-green-300 text-green-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                비품 반납 승인 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                대시보드 승인 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                대시보드가 승인되었을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleDashboardApprovedTest}
                className="px-6 py-3 bg-white border border-green-300 text-green-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                대시보드 승인 테스트
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                매니저 승인 알림 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                매니저가 승인되었을 때의 알림을 테스트합니다.
              </p>
              <button
                onClick={handleManagerApprovedTest}
                className="px-6 py-3 bg-white border border-purple-300 text-purple-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                매니저 승인 테스트
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
