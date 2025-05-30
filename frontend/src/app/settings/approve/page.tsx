"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { fetchUsersByStatus } from "@/utils/statusUserList";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";
import { useCustomToast } from "@/utils/toast";

export default function ApprovePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { loginUser } = useGlobalLoginUser();
  const managementDashboardName = loginUser.managementDashboardName;
  const [isInitialManager, setIsInitialManager] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"회원" | "매니저">("회원");
  const toast = useCustomToast();
  const [users, setUsers] = useState<
    {
      userId: number;
      email: string;
      name: string;
      phoneNumber: string;
      departmentName?: string;
      requestDate: string;
      approvalStatus: string;
    }[]
  >([]);
  const [filterStatus, setFilterStatus] = useState<
    "approve" | "reject" | "request"
  >("approve");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  useEffect(() => {
    if (!managementDashboardName) {
      console.error("관리 페이지 이름이 없습니다.");
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersData = await fetchUsersByStatus(
          filterStatus,
          selectedRole, // 역할에 따라 API 호출
          managementDashboardName,
          currentPage,
          10
        );

        const filteredUsers = usersData.users.filter(
          (user: {
            userId: number;
            email: string;
            name: string;
            phoneNumber: string;
            departmentName?: string;
            requestDate: string;
            approvalStatus: string;
          }) => user.userId !== loginUser.id
        );

        setUsers(filteredUsers);
        setSelectedIds([]); // 목록 갱신 시 선택 초기화
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, [
    filterStatus,
    selectedRole,
    managementDashboardName,
    currentPage,
    loginUser.id,
  ]);

  // 체크박스 핸들러
  const handleSelect = (e: ChangeEvent<HTMLInputElement>, userId: number) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [...prev, userId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = users.map((user) => user.userId);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };
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

  // 배치 처리 핸들러들
  const handleBatchApprove = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/approve/${id}`,
            { method: "POST", credentials: "include" }
          )
        )
      );
      toast.success("승인되었습니다.");
      location.reload();
    } catch (error) {
      toast.error("승인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleBatchReject = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/reject/${id}`,
            { method: "POST", credentials: "include" }
          )
        )
      );
      toast.success("거부되었습니다.");
      location.reload();
    } catch (error) {
      toast.error("거부 처리 중 오류가 발생했습니다.");
    }
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/delete/${id}`,
            { method: "PATCH", credentials: "include" }
          )
        )
      );
      toast.success("삭제되었습니다.");
      location.reload();
    } catch (error) {
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedRole === "회원" ? "사용자 관리" : "매니저 관리"}
              </h1>
              <p className="text-gray-600">
                {selectedRole === "회원" ? "사용자" : "매니저"}의 승인 및 권한을 관리할 수 있습니다.
              </p>
            </div>
            <Link
              href="/settings/approve/search"
              className="inline-flex items-center justify-center px-6 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-[#003380] transition-colors duration-200 whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              검색하기
            </Link>
          </div>

          {/* 역할 선택 섹션 */}
          {isInitialManager && (
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <label className="text-gray-700 font-medium whitespace-nowrap">역할 선택:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRole("회원")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedRole === "회원"
                      ? "bg-[#0047AB] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  회원
                </button>
                <button
                  onClick={() => setSelectedRole("매니저")}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedRole === "매니저"
                      ? "bg-[#0047AB] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  매니저
                </button>
              </div>
            </div>
          )}

          {/* 필터 탭 */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex gap-8 min-w-max">
              <button
                onClick={() => setFilterStatus("approve")}
                className={`px-6 py-3 font-medium border-b-2 transition-colors duration-200 ${
                  filterStatus === "approve"
                    ? "text-[#0047AB] border-[#0047AB]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                승인된 유저
              </button>
              <button
                onClick={() => setFilterStatus("reject")}
                className={`px-6 py-3 font-medium border-b-2 transition-colors duration-200 ${
                  filterStatus === "reject"
                    ? "text-[#0047AB] border-[#0047AB]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                거절된 유저
              </button>
              <button
                onClick={() => setFilterStatus("request")}
                className={`px-6 py-3 font-medium border-b-2 transition-colors duration-200 ${
                  filterStatus === "request"
                    ? "text-[#0047AB] border-[#0047AB]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                승인 대기 유저
              </button>
            </nav>
          </div>
        </div>

        {/* 테이블 섹션 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 배치 작업 버튼 */}
          {selectedIds.length > 0 && (
            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-gray-600">
                  {selectedIds.length}명의 사용자가 선택됨
                </span>
                <div className="flex gap-3">
                  {filterStatus === "request" && (
                    <>
                      <button
                        onClick={handleBatchApprove}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                      >
                        일괄 승인
                      </button>
                      <button
                        onClick={handleBatchReject}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        일괄 거절
                      </button>
                    </>
                  )}
                  {filterStatus === "reject" && (
                    <button
                      onClick={handleBatchDelete}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      일괄 삭제
                    </button>
                  )}
                  {filterStatus === "approve" && (
                    <button
                      onClick={handleBatchReject}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      일괄 거부
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#0047AB] focus:ring-[#0047AB]"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">전화번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">부서</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">요청일</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.userId)}
                        onChange={(e) => handleSelect(e, user.userId)}
                        className="rounded border-gray-300 text-[#0047AB] focus:ring-[#0047AB]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.departmentName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.requestDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {filterStatus === "request" ? (
                        <div className="flex justify-end gap-2">
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
                        </div>
                      ) : filterStatus === "reject" ? (
                        <button
                          onClick={() => handleDelete(user.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      ) : filterStatus === "approve" ? (
                        <button
                          onClick={() => handleReject(user.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          거부
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">표시할 사용자가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-6 py-2 text-gray-700">
              페이지 {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={users.length < 10}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
