"use client";

import Navigation from "@/components/Navigation/Navigation";
import { Header } from "../components/Header";
import Image from "next/image";

export default function ItemDetailPage() {
  return (
    <div className="bg-[#f8f9fb] min-h-screen w-full">
      {/* 헤더 */}
      <Header />
      <div className="flex pt-[60px]">
        {/* 네비게이션바 */}
        <Navigation userRole="MANAGER" />
        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex justify-center items-start p-8 ml-[280px]">
          {/* 제품 상세 정보 카드 */}
          <div className="bg-white rounded-lg shadow p-8 w-[420px] mr-8 min-h-[500px]">
            <h2 className="text-xl font-bold mb-6">제품 상세 정보</h2>
            <div className="flex gap-6">
              <div>
                <Image
                  src="/wand.png"
                  alt="제품 이미지"
                  width={180}
                  height={180}
                  className="rounded object-contain border"
                />
              </div>
              <div className="flex-1 text-sm text-gray-700">
                <div className="mb-2">
                  <span className="font-semibold">제품명</span>: 엘더완드 본체
                </div>
                <div className="mb-2">
                  <span className="font-semibold">고유번호</span>: 123123123
                </div>
                <div className="mb-2">
                  <span className="font-semibold">총 보유수량</span>: 120
                </div>
                <div className="mb-2">
                  <span className="font-semibold">현재재고</span>: 120
                </div>
                <div className="mb-2">
                  <span className="font-semibold">제품 위치</span>: B동1-1-2
                </div>
                <div className="mb-2">
                  <span className="font-semibold">구매일</span>: 2023-05-02
                </div>
                <div className="mb-2">
                  <span className="font-semibold">구매처</span>: 다이아건 앨리리
                </div>
              </div>
            </div>
            <button className="mt-8 px-4 py-2 bg-gray-100 rounded border text-gray-700 hover:bg-gray-200 transition-colors w-full">
              돌아가기
            </button>
          </div>
          {/* 재고 내역 카드 */}
          <div className="bg-white rounded-lg shadow p-8 w-[350px] min-h-[500px]">
            <h2 className="text-lg font-bold mb-4">현재 재고 및 내역</h2>
            <div className="text-3xl font-bold text-blue-700 mb-4">420</div>
            <div className="flex border-b text-gray-500 text-sm mb-2">
              <div className="w-1/3 text-center py-2 border-b-2 border-blue-600 font-semibold text-blue-700">
                입고
              </div>
              <div className="w-1/3 text-center py-2">출고</div>
              <div className="w-1/3 text-center py-2">조정</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">입고</span>
                <span className="text-green-600 font-bold">+420</span>
                <span className="text-gray-400">2023-12-22</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">입고</span>
                <span className="text-green-600 font-bold">+120</span>
                <span className="text-gray-400">2024-01-23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">출고</span>
                <span className="text-red-600 font-bold">-120</span>
                <span className="text-gray-400">2024-01-23</span>
              </div>
            </div>
            <div className="mt-8 text-xs text-gray-400 text-center">
              더 이상 내역을 불러올 데이터가 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
