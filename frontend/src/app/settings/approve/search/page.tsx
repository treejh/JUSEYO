"use client";

import { useState, useEffect } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";
import { useCustomToast } from "@/utils/toast";

export default function ApproveSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"회원" | "매니저">("회원");
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { loginUser } = useGlobalLoginUser();
  const [isInitialManager, setIsInitialManager] = useState(false);
  const toast = useCustomToast();

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

  return (
    <div className="p-6 bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0047AB]">이름으로 검색</h1>
        <Link
          href="/settings/approve"
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          목록으로 돌아가기
        </Link>
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as "회원" | "매니저")}
          className="px-4 py-2 border border-gray-300 rounded-lg"
          disabled={!isInitialManager && selectedRole === "매니저"}
        >
          <option value="회원">회원</option>
          {isInitialManager && <option value="매니저">매니저</option>}
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="이름으로 검색"
          className="px-4 py-2 border border-gray-300 rounded-lg w-64"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          검색
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-200 mt-6">
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
              <td colSpan={7} className="text-center py-8 text-gray-400">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user: any, index: number) => (
              <tr key={user.userId} className="hover:bg-gray-50">
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
                  {user.requestDate
                    ? new Date(user.requestDate).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.approvalStatus}
                </td>
                <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                  {/* 승인 대기 상태 */}
                  {user.approvalStatus === "REQUESTED" && (
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

                  {/* 승인됨 */}
                  {user.approvalStatus === "APPROVED" && (
                    <button
                      onClick={() => handleReject(user.userId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      거부
                    </button>
                  )}

                  {/* 거부됨 */}
                  {user.approvalStatus === "REJECTED" && (
                    <>
                      <button
                        onClick={() => handleApprove(user.userId)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
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
