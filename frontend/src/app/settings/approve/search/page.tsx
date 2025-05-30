"use client";

import { useState, useEffect } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";
import { useCustomToast } from "@/utils/toast";
import { useRouter } from "next/navigation";

export default function ApproveSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"회원" | "매니저">("회원");
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { loginUser } = useGlobalLoginUser();
  const [isInitialManager, setIsInitialManager] = useState(false);
  const toast = useCustomToast();
  const router = useRouter();

  useEffect(() => {
    // 네비게이션 상태 유지를 위해 전역 상태 업데이트
    const updateNavigationState = () => {
      const event = new CustomEvent('onPageChange', { detail: 'user-management' });
      window.dispatchEvent(event);
    };
    
    updateNavigationState();
  }, []);

  useEffect(() => {
    const checkInitialManager = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/validation/initialManager`,
        { credentials: "include" }
      );
      const result = await response.json();
      setIsInitialManager(result.data);
    };

    checkInitialManager();
  }, []);

  const handleDelete = async (userId: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/delete/${userId}`,
        { method: "PATCH", credentials: "include" }
      );
      location.reload();
    } catch (error) {
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/approve/${userId}`,
        { method: "POST", credentials: "include" }
      );
      location.reload();
    } catch (error) {
      toast.error("승인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (userId: number) => {
    try {
      console.log("Rejecting userId:", userId);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/reject/${userId}`,
        { method: "POST", credentials: "include" }
      );
      location.reload();
    } catch (error) {
      toast.error("거부 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    let url = "";
    if (selectedRole === "회원") {
      url = `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/api/v1/users/search?username=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&size=10`;
    } else {
      url = `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/api/v1/users/search/manager?username=${encodeURIComponent(
        searchTerm
      )}&page=${currentPage}&size=10`;
    }
    try {
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      const filteredUsers = (data.data.content || []).filter(
        (user: any) => user.userId !== loginUser.id
      );
      setUsers(filteredUsers);
    } catch (e) {
      toast.error("검색 중 오류가 발생했습니다.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  // 목록으로 돌아가기 핸들러
  const handleGoBack = () => {
    router.push("/settings/approve");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                사용자 검색
              </h1>
              <p className="text-gray-600">
                이름으로 {selectedRole}을 검색할 수 있습니다
              </p>
            </div>
            <div>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB]"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                목록으로 돌아가기
              </button>
            </div>
          </div>

          {/* 검색 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-end">
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">검색 대상</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "회원" | "매니저")}
                  className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  disabled={!isInitialManager && selectedRole === "매니저"}
                >
                  <option value="회원">회원</option>
                  {isInitialManager && <option value="매니저">매니저</option>}
                </select>
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="검색할 이름을 입력하세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-[#003380] transition-colors duration-200 whitespace-nowrap"
                  >
                    검색
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[60px]">번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">전화번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">요청일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="mt-2 text-gray-500">검색 결과가 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user: any, index: number) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.departmentName || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.requestDate
                            ? new Date(user.requestDate).toLocaleDateString()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${user.approvalStatus === "APPROVED" ? "bg-green-100 text-green-800" :
                            user.approvalStatus === "REJECTED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"}`}>
                          {user.approvalStatus === "APPROVED" ? "승인됨" :
                           user.approvalStatus === "REJECTED" ? "거부됨" :
                           "대기중"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {user.approvalStatus === "REQUESTED" && (
                            <>
                              <button
                                onClick={() => handleApprove(user.userId)}
                                className="text-green-600 hover:text-green-900"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleReject(user.userId)}
                                className="text-red-600 hover:text-red-900"
                              >
                                거절
                              </button>
                            </>
                          )}
                          {user.approvalStatus === "APPROVED" && (
                            <button
                              onClick={() => handleReject(user.userId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              거부
                            </button>
                          )}
                          {user.approvalStatus === "REJECTED" && (
                            <button
                              onClick={() => handleDelete(user.userId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
