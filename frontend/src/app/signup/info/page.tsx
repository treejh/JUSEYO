"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagementPage() {
  const [managementPageName, setManagementPageName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState<string[]>([]); // 부서 목록
  const [isManagementPageValid, setIsManagementPageValid] = useState(false); // 관리 페이지 검증 상태
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 페이지 로드 시 로컬 스토리지 값 제거
  useEffect(() => {
    localStorage.removeItem("managementPageName");
    localStorage.removeItem("departmentName");
  }, []);

  // 관리 페이지 검증 및 부서 조회
  const validateManagementPage = async () => {
    setError("");
    setMessage("");
    setDepartments([]);

    if (!managementPageName.trim()) {
      setError("관리 페이지 이름을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

      // 관리 페이지 검증
      const validationResponse = await fetch(
        `${API_URL}/api/v1/management/validation?name=${managementPageName}`,
        {
          method: "POST",
        }
      );

      if (!validationResponse.ok) {
        throw new Error("관리 페이지 검증에 실패했습니다.");
      }

      const validationData = await validationResponse.json();
      if (!validationData.data) {
        setIsManagementPageValid(false);
        setError("존재하지 않는 관리 페이지입니다.");
        return;
      }

      setIsManagementPageValid(true);
      setMessage("존재하는 관리 페이지입니다.");

      // 부서 조회
      const departmentResponse = await fetch(
        `${API_URL}/api/v1/departments/management?name=${managementPageName}&page=0&size=5`,
        {
          method: "GET",
        }
      );

      if (!departmentResponse.ok) {
        throw new Error("부서 조회에 실패했습니다.");
      }

      const departmentData = await departmentResponse.json();
      const departmentList = departmentData.content.map(
        (department: { name: string }) => department.name
      );
      setDepartments(departmentList);
    } catch (error) {
      setError("관리 페이지 검증 및 부서 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!managementPageName.trim() || !departmentName.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 로컬 스토리지에 저장
    localStorage.setItem("managementPageName", managementPageName);
    localStorage.setItem("departmentName", departmentName);

    // 회원가입 페이지로 이동
    router.push("/signup/member");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0047AB]">
            관리 페이지 설정
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            관리 페이지 이름을 입력하고 검증을 완료하세요.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            관리 페이지 이름
          </label>
          <input
            type="text"
            value={managementPageName}
            onChange={(e) => setManagementPageName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="관리 페이지 이름을 입력하세요"
          />
          <button
            type="button"
            onClick={validateManagementPage}
            className="w-full mt-2 py-2 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "검증 중..." : "관리 페이지 검증"}
          </button>
        </div>

        {isManagementPageValid && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부서 선택
              </label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">부서를 선택하세요</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0047AB] text-white font-semibold rounded-xl hover:bg-blue-800 transition-all"
            >
              다음
            </button>
          </>
        )}
      </form>
    </div>
  );
}
