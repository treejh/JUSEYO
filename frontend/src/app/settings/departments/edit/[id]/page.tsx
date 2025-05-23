"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { useParams } from "next/navigation";

const EditDepartmentPage: FC = () => {
  const params = useParams();
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    // TODO: API에서 부서 정보를 가져오는 로직 구현
    // 임시 데이터
    const mockDepartment = {
      id: Number(params.id),
      name: "개발팀",
      memberCount: 15,
      status: "사용"
    };
    setDepartmentName(mockDepartment.name);
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 부서 수정 로직 구현
    console.log("부서 수정:", { id: params.id, name: departmentName });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 전체 레이아웃 컨테이너 */}
      <div className="flex min-h-screen">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">부서 수정</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부서명
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="부서명을 입력해 주세요."
                className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex space-x-4 mt-12">
              <Button
                type="submit"
                className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors"
              >
                수정
              </Button>
              <Link href="/settings/departments">
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-base"
                >
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDepartmentPage; 