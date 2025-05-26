"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiUsers } from "react-icons/hi2";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

interface DepartmentItem {
  id: number;
  name: string;
  managementDashboardId: number;
  userCount: number;
}

const ITEMS_PER_PAGE = 5;

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보

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
          credentials: "include", // ✅ 쿠키 포함
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
  }, [currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 전체 레이아웃 컨테이너 */}
      <div className="flex min-h-screen">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">부서 관리</h1>
          </div>

          {/* 부서 목록 테이블 */}
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
                  <tr
                    key={department.id}
                    className="border-b border-[#EEEEEE] hover:bg-[#0047AB]/5 transition-colors cursor-pointer"
                  >
                    <td className="text-left px-6 py-4">
                      <Link
                        href={`/settings/departments/edit/${department.id}`}
                        className="hover:text-[#0047AB] hover:font-semibold transition-all flex items-center gap-4"
                      >
                        <HiUsers className="text-gray-400 text-lg" />
                        {department.name}
                      </Link>
                    </td>
                    <td className="text-center px-6 py-4">
                      {department.userCount}
                    </td>
                    <td className="text-center px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
                        삭제
                      </button>
                    </td>
                  </tr>
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

            {/* 페이지네이션 */}
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
