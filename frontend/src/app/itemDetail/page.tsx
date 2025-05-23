"use client";

import React, { useState } from "react";

const product = {
  name: "딱총나무 볼펜",
  code: "123123123",
  total: 120,
  current: 120,
  location: "B창고1-2",
  date: "2025-05-02",
  buyer: "다이애건 앨리리",
  image: "/wand.png", // public 폴더에 이미지 파일을 넣으세요
};

const stockHistory = [
  { type: "입고", date: "2024-12-22", change: 120, balance: 540 },
  { type: "출고", date: "2024-12-23", change: -120, balance: 420 },
  { type: "입고", date: "2024-12-24", change: 100, balance: 520 },
  { type: "출고", date: "2024-12-25", change: -50, balance: 470 },
];

const tabList = ["전체", "입고", "출고"] as const;
type Tab = (typeof tabList)[number];

export default function ItemDetailPage() {
  const [tab, setTab] = useState<Tab>("전체");
  const [imageLoaded, setImageLoaded] = useState(false);

  const filteredHistory = stockHistory.filter((h) => {
    if (tab === "입고") return h.type === "입고";
    if (tab === "출고") return h.type === "출고";
    if (tab === "전체") return true;
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 p-4 gap-6">
      {/* 좌측: 제품 상세 정보 */}
      <div className="flex-1 bg-white rounded-xl p-6 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">제품 상세 정보</h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {product.current > 0 ? "재고있음" : "재고없음"}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-gray-700">
                제품 정보
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    제품명
                  </span>
                  <span className="flex-1 text-gray-800">{product.name}</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    고유번호
                  </span>
                  <span className="flex-1 font-mono text-gray-800">
                    {product.code}
                  </span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    총 보유수량
                  </span>
                  <span className="flex-1 text-gray-800">{product.total}</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    현재재고
                  </span>
                  <span className="flex-1 text-gray-800">
                    {product.current}
                  </span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    제품 위치
                  </span>
                  <span className="flex-1 text-gray-800">
                    {product.location}
                  </span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    구매일
                  </span>
                  <span className="flex-1 text-gray-800">{product.date}</span>
                </div>
                <div className="flex items-center p-2 hover:bg-gray-100 rounded transition-colors">
                  <span className="w-28 font-semibold text-gray-600">
                    구매처
                  </span>
                  <span className="flex-1 text-gray-800">{product.buyer}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-[300px] flex flex-col items-center">
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={product.image}
                alt={`${product.name} 제품 이미지`}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              onClick={() => window.open(product.image, "_blank")}
            >
              이미지 크게 보기
            </button>
          </div>
        </div>
      </div>

      {/* 우측: 재고 내역 */}
      <div className="w-full lg:w-[400px] bg-white rounded-xl p-6 shadow-lg transition-shadow hover:shadow-xl">
        <div className="mb-6">
          <div className="text-sm text-gray-500">현재 재고 및 내역</div>
          <div className="text-3xl font-bold text-blue-600">
            {product.current}
            <span className="text-sm text-gray-400 ml-2">개</span>
          </div>
        </div>

        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
          {tabList.map((t) => (
            <button
              key={t}
              className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-all ${
                tab === t
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => setTab(t)}
              aria-selected={tab === t}
              role="tab"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 mb-2">내역이 없습니다</p>
              <p className="text-sm text-gray-400">
                해당 유형의 재고 변동 내역이 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{h.type}</div>
                    <div className="text-xs text-gray-400">{h.date}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={`font-bold text-lg ${
                        h.change > 0
                          ? "text-green-500"
                          : h.change < 0
                          ? "text-red-500"
                          : "text-gray-600"
                      }`}
                    >
                      {h.change > 0 ? `+${h.change}` : h.change}
                    </div>
                    <div className="text-xs text-gray-400">
                      잔여: {h.balance}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
