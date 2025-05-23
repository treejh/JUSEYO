"use client";

import Link from "next/link";
import { FC, useState } from "react";
import { HiUsers } from "react-icons/hi2";

interface DepartmentItem {
  id: number;
  name: string;
  memberCount: number;
  status: "삭제" | "사용";
}

const ITEMS_PER_PAGE = 10;

const DepartmentManagementPage: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // 실제로는 API에서 받아올 데이터
  const departments: DepartmentItem[] = [
    { id: 1, name: "인사팀", memberCount: 8, status: "사용" },
    { id: 2, name: "개발팀", memberCount: 15, status: "사용" },
    { id: 3, name: "마케팅팀", memberCount: 10, status: "사용" },
    { id: 4, name: "영업팀", memberCount: 12, status: "사용" },
    { id: 5, name: "디자인팀", memberCount: 6, status: "사용" },
    { id: 6, name: "재무팀", memberCount: 5, status: "사용" },
    { id: 7, name: "운영팀", memberCount: 7, status: "사용" },
    { id: 8, name: "고객지원팀", memberCount: 9, status: "삭제" },
    { id: 9, name: "기획팀", memberCount: 6, status: "사용" },
    { id: 10, name: "연구개발팀", memberCount: 11, status: "사용" },
    { id: 11, name: "총무팀", memberCount: 4, status: "사용" },
  ];

  // 페이지네이션 계산
  const totalPages = Math.ceil(departments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDepartments = departments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = (id: number) => {
    // TODO: 삭제 로직 구현
    console.log("삭제:", id);
  };

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
                {paginatedDepartments.map((department, index) => (
                  <tr
                    key={department.id}
                    className={`border-b border-[#EEEEEE] hover:bg-[#0047AB]/5 transition-colors cursor-pointer
                      ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
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
                    <td className="text-center px-6 py-4">{department.memberCount}</td>
                    <td className="text-center px-6 py-4">
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                      >
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