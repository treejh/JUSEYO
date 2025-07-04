"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC, useState } from "react";
import { useCustomToast } from "@/utils/toast";

const AddDepartmentPage: FC = () => {
  const [departmentName, setDepartmentName] = useState("");
  const toast = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (departmentName.length > 10) {
      toast.error("부서 이름은 10글자까지 가능합니다.");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/departments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: departmentName }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "부서 생성에 실패했습니다.");
        return;
      }
      toast.success("부서가 생성되었습니다.");
      window.location.href = "/settings/departments";
    } catch (err) {
      toast.error("부서 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 전체 레이아웃 컨테이너 */}
      <div className="flex min-h-screen">
        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">부서 추가</h1>
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
                확인
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

export default AddDepartmentPage;
