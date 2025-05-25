"use client";

import { useState, useEffect } from "react";
import { fetchUsersByStatus } from "@/utils/statusUserList"; // 유저 상태별 데이터 가져오기 함수
import { useGlobalLoginUser } from "@/stores/auth/loginMember"; // 로그인 유저 정보 가져오기

export default function ApprovePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { loginUser } = useGlobalLoginUser(); // 로그인 유저 정보
  const managementDashboardName = loginUser.managementDashboardName; // 관리 페이지 이름 가져오기
  const [isInitialManager, setIsInitialManager] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"회원" | "매니저">("회원");
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState<
    "approve" | "reject" | "request"
  >("approve");

  useEffect(() => {
    // 최초 매니저 여부 확인 (예시: /validation/initialManager API 호출)
    const checkInitialManager = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/validation/initialManager`,
        { credentials: "include" } // 쿠키 포함
      );
      const data = await response.json();
      setIsInitialManager(data.isInitialManager);
    };

    checkInitialManager();
  }, []);

  useEffect(() => {
    if (!managementDashboardName) {
      console.error("관리 페이지 이름이 없습니다.");
      return;
    }

    const fetchUsers = async () => {
      if (!managementDashboardName) {
        console.error("관리 페이지 이름이 없습니다.");
        return;
      }

      try {
        const usersData = await fetchUsersByStatus(
          filterStatus,
          managementDashboardName,
          currentPage,
          10
        );
        setUsers(usersData.users);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, [filterStatus, managementDashboardName, currentPage]);

  const handleApprove = (email: string) => {
    alert(`${email} 승인되었습니다.`);
  };

  const handleReject = (email: string) => {
    alert(`${email} 거절되었습니다.`);
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold text-[#0047AB] mb-6">
        승인 대기 요청 승인
      </h1>

      {isInitialManager && (
        <div className="mb-4">
          <label className="mr-4 font-bold">역할 선택:</label>
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
                {/* 요청일을 날짜와 시간만 표시 */}
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
                {user.approvalStatus === "대기중" && (
                  <>
                    <button
                      onClick={() => handleApprove(user.email)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(user.email)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      거절
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
