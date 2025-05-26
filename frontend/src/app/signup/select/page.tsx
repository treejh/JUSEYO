"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManagementSelectPage() {
  const router = useRouter();

  const handleManagementSelect = (hasManagementPage: boolean) => {
    if (hasManagementPage) {
      router.push("/signup/managerinfo"); // 관리 페이지가 있는 경우
    } else {
      router.push("/signup/initial"); // 관리 페이지가 없는 경우
    }
  };
  const handleBackToSelection = () => {
    router.push("/signup/info"); // 회원 유형 선택 페이지로 이동
  };

  return (
    <div className="min-h-screen h-screen bg-white flex overflow-hidden">
      <div className="w-1/2 h-screen"></div>

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
      <div className="w-3/1 h-screen flex items-center pl-12 pr-12 overflow-hidden">
        <div className="shadow-xl rounded-2xl overflow-hidden w-3/4 mx-auto">
          <div className="bg-[#0047AB] text-white px-8 py-6 text-center">
            <h2 className="text-2xl font-bold">조직 관리 페이지 설정</h2>
            <p className="text-base mt-2 opacity-80">
              현재 조직의 관리 페이지 상태를 선택해주세요.
            </p>
          </div>

          <div className="bg-white p-8 grid grid-cols-2 gap-6">
            <button
              className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
              onClick={() => handleManagementSelect(true)}
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
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
              <h2 className="text-xl font-bold text-[#0047AB] mb-2">
                관리 페이지 있음
              </h2>
              <p className="text-base text-gray-500 text-center">
                이미 조직에 관리 페이지가 있습니다.
              </p>
              <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </button>

            <button
              className="flex flex-col items-center justify-center py-8 px-6 border-2 border-gray-100 rounded-xl bg-white hover:border-[#0047AB] hover:shadow-md transition-all group"
              onClick={() => handleManagementSelect(false)}
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
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
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0047AB] mb-2">
                관리 페이지 없음
              </h2>
              <p className="text-base text-gray-500 text-center">
                새로운 관리 페이지를 생성합니다.
              </p>
              <div className="text-[#0047AB] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </button>
          </div>

          <div className="bg-gray-50 px-8 py-4 text-center">
            <button
              onClick={handleBackToSelection}
              className="inline-flex items-center justify-center text-[#0047AB] font-medium hover:underline text-base"
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
              회원 유형 선택으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
