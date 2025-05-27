"use client";

import { useState, useEffect } from "react";
import { fetchUsersByStatus } from "@/utils/statusUserList";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";

export default function ApprovePage() {
  const [searchTerm, setSearchTerm] = useState("");
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
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, [filterStatus, selectedRole, managementDashboardName, currentPage]);

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

      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
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
            {/* 부서 이름 추가 */}
            <th className="border border-gray-200 px-4 py-2 text-left">
              요청일
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">상태</th>
            <th className="border border-gray-200 px-4 py-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any, index: number) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">{index + 1}</td>
              <td className="border border-gray-200 px-4 py-2">{user.email}</td>
              <td className="border border-gray-200 px-4 py-2">{user.name}</td>
              <td className="border border-gray-200 px-4 py-2">
                {user.phoneNumber}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {user.departmentName || "N/A"}
              </td>
              {/* 부서 이름 추가 */}
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
                      onClick={() => handleApprove(user.userId)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(user.userId)}
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
                      onClick={() => handleReject(user.userId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      거부
                    </button>
                  ))}

                {filterStatus === "reject" && (
                  <>
                    <button
                      onClick={() => handleApprove(user.userId)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleDelete(user.userId)} // 삭제 핸들러가 필요하다면 정의해야 함
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      삭제
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
