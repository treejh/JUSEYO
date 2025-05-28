"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { fetchUsersByStatus } from "@/utils/statusUserList";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";

export default function ApprovePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { loginUser } = useGlobalLoginUser();
  const managementDashboardName = loginUser.managementDashboardName;
  const [isInitialManager, setIsInitialManager] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"회원" | "매니저">("회원");
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
      alert("삭제 처리 중 오류가 발생했습니다.");
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
      alert("승인 처리 중 오류가 발생했습니다.");
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
      alert("거부 처리 중 오류가 발생했습니다.");
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
      alert("승인되었습니다.");
      location.reload();
    } catch (error) {
      alert("승인 처리 중 오류가 발생했습니다.");
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
      alert("거부되었습니다.");
      location.reload();
    } catch (error) {
      alert("거부 처리 중 오류가 발생했습니다.");
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
      alert("삭제되었습니다.");
      location.reload();
    } catch (error) {
      alert("삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-6 bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0047AB]">
          {selectedRole === "회원" ? "사용자 관리" : "매니저 관리"}
        </h1>
        <Link
          href="/settings/approve/search"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          검색하기
        </Link>
      </div>

      {isInitialManager && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="font-bold">역할 선택:</label>
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as "회원" | "매니저")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="회원">회원</option>
              <option value="매니저">매니저</option>
            </select>
          </div>
        </div>
      )}

      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setFilterStatus("approve")}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === "approve"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          승인된 유저
        </button>
        <button
          onClick={() => setFilterStatus("reject")}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === "reject" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          거절된 유저
        </button>
        <button
          onClick={() => setFilterStatus("request")}
          className={`px-4 py-2 rounded-lg ${
            filterStatus === "request"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          요청된 유저
        </button>
      </div>

      {/* 배치 처리 버튼 영역 */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex space-x-4">
          {filterStatus === "approve" && (
            <button
              onClick={handleBatchReject}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              선택한 유저 거부
            </button>
          )}
          {filterStatus === "reject" && (
            <>
              <button
                onClick={handleBatchApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                선택한 유저 승인
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                선택한 유저 삭제
              </button>
            </>
          )}
          {filterStatus === "request" && (
            <>
              <button
                onClick={handleBatchApprove}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                선택한 유저 승인
              </button>
              <button
                onClick={handleBatchReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                선택한 유저 거부
              </button>
            </>
          )}
        </div>
      )}

      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {/* 추가: 체크박스 헤더 */}
            <th className="border border-gray-200 px-4 py-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  users.length > 0 && selectedIds.length === users.length
                }
              />
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">번호</th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              이메일
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">이름</th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              핸드폰 번호
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              부서 이름
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              요청일
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">상태</th>
            <th className="border border-gray-200 px-4 py-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-8 text-gray-400">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user: any, index: number) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                {/* 체크박스 */}
                <td className="border border-gray-200 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.userId)}
                    onChange={(e) => handleSelect(e, user.userId)}
                  />
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.email}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.phoneNumber}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.departmentName || "N/A"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {new Date(user.requestDate).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.approvalStatus}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  {filterStatus === "request" && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(user.userId);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => {
                          handleReject(user.userId);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        거부
                      </button>
                    </>
                  )}

                  {filterStatus === "approve" &&
                    (user.approvalStatus === "REJECTED" ? (
                      <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                        거부됨
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          handleReject(user.userId);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        거부
                      </button>
                    ))}

                  {filterStatus === "reject" && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(user.userId);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(user.userId);
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
