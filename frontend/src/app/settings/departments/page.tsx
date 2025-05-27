"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiUsers } from "react-icons/hi2";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface DepartmentItem {
  id: number;
  name: string;
  managementDashboardId: number;
  userCount: number;
}

interface UserItem {
  id: number;
  departmentName: string;
  username: string;
}

const ITEMS_PER_PAGE = 5;

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { loginUser } = useGlobalLoginUser();

  // 펼쳐진 부서 id와 유저 리스트 상태
  const [openedDeptIds, setOpenedDeptIds] = useState<number[]>([]);
  const [userList, setUserList] = useState<{ [key: number]: UserItem[] }>({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/v1/departments/management?name=${
          loginUser.managementDashboardName
        }&page=${currentPage - 1}&size=${ITEMS_PER_PAGE}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("부서 목록 요청 실패", res.status);
        return;
      }
      const data = await res.json();
      setDepartments(data.content);
      setTotalPages(data.totalPages);
    };

    fetchDepartments();
  }, [currentPage, loginUser.managementDashboardName]);

  // 부서별 유저 리스트 불러오기
  const handleShowUsers = async (departmentId: number) => {
    if (openedDeptIds.includes(departmentId)) {
      setOpenedDeptIds(openedDeptIds.filter((id) => id !== departmentId));
      return;
    }
    setLoadingUsers(true);
    // 유저 리스트는 부서별로 따로 관리해야 여러개 펼칠 때 각각 보임
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/departments/${departmentId}/users`,
      { credentials: "include" }
    );
    let data: UserItem[] = [];
    if (res.ok) data = await res.json();
    setUserList((prev) => ({
      ...prev,
      [departmentId]: data,
    }));
    setOpenedDeptIds([...openedDeptIds, departmentId]);
    setLoadingUsers(false);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleEditClick = (userId: number, currentDeptId: number) => {
    setEditUserId(userId);
    setSelectedDeptId(currentDeptId);
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeptId(Number(e.target.value));
  };

  const handleSaveDept = async (userId: number) => {
    if (!selectedDeptId) return;
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/departments/users`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          departmentId: selectedDeptId,
        }),
      }
    );
    window.location.reload();
  };

  const handleDeleteDepartment = async (department: DepartmentItem) => {
    if (department.userCount > 0) {
      alert("구성원이 존재하여 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("정말로 이 부서를 삭제하시겠습니까?")) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/departments/${department.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (res.status === 204) {
      alert("부서가 삭제되었습니다.");
      window.location.reload();
    } else {
      alert("부서 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">부서 관리</h1>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border border-[#EEEEEE] rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="border-b border-[#EEEEEE]">
                  <th className="text-left px-6 py-4 text-gray-900 font-bold text-base">
                    부서명
                  </th>
                  <th className="text-center px-6 py-4 text-gray-900 font-bold text-base">
                    구성원 수
                  </th>
                  <th className="w-24 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <React.Fragment key={department.id}>
                    <tr className="border-b border-[#EEEEEE] hover:bg-[#0047AB]/5 transition-colors">
                      <td className="text-left px-6 py-4 flex items-center gap-2">
                        <button
                          onClick={() => handleShowUsers(department.id)}
                          className="text-lg focus:outline-none flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition"
                          aria-label="구성원 토글"
                        >
                          {openedDeptIds.includes(department.id) ? (
                            <FiChevronUp className="text-gray-600" />
                          ) : (
                            <FiChevronDown className="text-gray-600" />
                          )}
                        </button>

                        <Link
                          href={`/settings/departments/edit/${department.id}`}
                          className="hover:text-[#0047AB] hover:font-semibold transition-all flex items-center gap-2"
                        >
                          <HiUsers className="text-gray-400 text-lg" />
                          {department.name}
                        </Link>
                      </td>
                      <td className="text-center px-6 py-4">
                        {department.userCount}
                      </td>
                      <td className="text-center px-6 py-4"></td>
                      <td className="text-center px-6 py-4">
                        <button
                          onClick={() => handleDeleteDepartment(department)}
                          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                    {openedDeptIds.includes(department.id) && (
                      <tr>
                        <td colSpan={3} className="bg-gray-50 px-6 py-4">
                          {loadingUsers ? (
                            <div className="text-gray-500">로딩 중...</div>
                          ) : !userList[department.id] ||
                            userList[department.id].length === 0 ? (
                            <div className="text-gray-500">
                              구성원이 없습니다.
                            </div>
                          ) : (
                            <ul className="divide-y divide-gray-200">
                              {userList[department.id].map((user, idx) => (
                                <li
                                  key={user.id}
                                  className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition"
                                >
                                  <div className="flex space-x-6 text-sm text-gray-700">
                                    <span>{idx + 1}</span>
                                    <span>{user.departmentName}</span>
                                    <span>
                                      <span className="font-semibold text-gray-600">
                                        이름 :
                                      </span>{" "}
                                      {user.username}
                                    </span>
                                  </div>
                                  <div>
                                    {editUserId === user.id ? (
                                      <>
                                        <select
                                          value={selectedDeptId ?? ""}
                                          onChange={handleDeptChange}
                                          className="border px-2 py-1 rounded mr-2"
                                        >
                                          {departments.map((dept) => (
                                            <option
                                              key={dept.id}
                                              value={dept.id}
                                            >
                                              {dept.name}
                                            </option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() =>
                                            handleSaveDept(user.id)
                                          }
                                          className="px-2 py-1 bg-blue-500 text-white rounded mr-1"
                                        >
                                          저장
                                        </button>
                                        <button
                                          onClick={() => setEditUserId(null)}
                                          className="px-2 py-1 bg-gray-300 rounded"
                                        >
                                          취소
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleEditClick(
                                            user.id,
                                            departments.find(
                                              (d) =>
                                                d.name === user.departmentName
                                            )?.id ?? 0
                                          )
                                        }
                                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                      >
                                        수정
                                      </button>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <div className="mt-8">
              <Link href="/settings/departments/add">
                <button className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors">
                  + 추가하기
                </button>
              </Link>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? "bg-gray-200 text-gray-700"
                          : "border border-[#EEEEEE] hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagementPage;
