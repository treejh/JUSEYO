"use client";

import { useState } from "react";

export default function ApprovePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 샘플 데이터
  const users: {
    pageName: string;
    email: string;
    name: string;
    phone: string;
    requestDate: string;
    status: keyof typeof statusStyles;
  }[] = [
    {
      pageName: "카페 주세요",
      email: "kim@example.com",
      name: "김주세요",
      phone: "010-1234-5678",
      requestDate: "2023-08-15",
      status: "대기중",
    },
    {
      pageName: "레스토랑 주세요",
      email: "park@example.com",
      name: "박맛있는",
      phone: "010-9876-5432",
      requestDate: "2023-08-14",
      status: "대기중",
    },
    {
      pageName: "미용실 주세요",
      email: "lee@example.com",
      name: "이발사",
      phone: "010-5555-7777",
      requestDate: "2023-08-12",
      status: "승인됨",
    },
    {
      pageName: "꽃집 주세요",
      email: "choi@example.com",
      name: "최꽃집",
      phone: "010-3333-4444",
      requestDate: "2023-08-10",
      status: "거절됨",
    },
    {
      pageName: "서점 주세요",
      email: "jung@example.com",
      name: "정책방",
      phone: "010-2222-8888",
      requestDate: "2023-08-09",
      status: "대기중",
    },
  ];

  // 상태별 스타일
  const statusStyles = {
    대기중: "bg-yellow-100 text-yellow-600",
    승인됨: "bg-green-100 text-green-600",
    거절됨: "bg-red-100 text-red-600",
  };

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

      {/* 검색 필드 */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="이름, 이메일, 페이지명으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0047AB]"
        />
        <button className="ml-2 px-4 py-2 bg-[#0047AB] text-white rounded-lg hover:bg-blue-800">
          검색
        </button>
      </div>

      {/* 테이블 */}
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 px-4 py-2 text-left">
              페이지 이름
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              요청자 이메일
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left">
              요청자 이름
            </th>
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
          {users.map((user, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">
                {user.pageName}
              </td>
              <td className="border border-gray-200 px-4 py-2">{user.email}</td>
              <td className="border border-gray-200 px-4 py-2">{user.name}</td>
              <td className="border border-gray-200 px-4 py-2">{user.phone}</td>
              <td className="border border-gray-200 px-4 py-2">
                {user.requestDate}
              </td>
              <td
                className={`border border-gray-200 px-4 py-2 rounded-lg text-center ${
                  statusStyles[user.status as keyof typeof statusStyles]
                }`}
              >
                {user.status}
              </td>
              <td className="border border-gray-200 px-4 py-2 flex space-x-2">
                {user.status === "대기중" && (
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
                {user.status === "승인됨" && (
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                    승인됨
                  </span>
                )}
                {user.status === "거절됨" && (
                  <span className="px-4 py-2 bg-red-500 text-white rounded-lg">
                    거절됨
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">
          이전
        </button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded-lg">
          1
        </button>
        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">
          2
        </button>
        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">
          3
        </button>
        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">
          다음
        </button>
      </div>
    </div>
  );
}
