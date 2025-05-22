"use client";

import { useCustomToast } from "@/utils/toast";
import { useState } from "react";

export default function ToastExamplePage() {
  const toast = useCustomToast();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">커스텀 토스트 예시</h1>
      
      <div className="flex justify-end mb-4">
        <button
          className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? '라이트모드로 전환' : '다크모드로 전환'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">기본 토스트</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              onClick={() => toast.success("성공적으로 처리되었습니다!", { isDark: isDarkMode })}
            >
              성공 토스트
            </button>
            
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              onClick={() => toast.error("오류가 발생했습니다!", { isDark: isDarkMode })}
            >
              에러 토스트
            </button>
            
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              onClick={() => toast.warning("주의하세요!", { isDark: isDarkMode })}
            >
              경고 토스트
            </button>
            
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => toast.info("정보가 업데이트되었습니다.", { isDark: isDarkMode })}
            >
              정보 토스트
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">상황별 토스트</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
              onClick={() => toast.notify.general("일반적인 성공/실패 알림", "success", { isDark: isDarkMode })}
            >
              일반 알림 (top-right)
            </button>
            
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
              onClick={() => toast.notify.mobile("모바일용 메시지입니다", "info", { isDark: isDarkMode })}
            >
              모바일 알림 (bottom-center)
            </button>
            
            <button
              className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800"
              onClick={() => toast.notify.important("⚠️ 중요한 오류가 발생했습니다!", { isDark: isDarkMode })}
            >
              중요 오류 (top-center)
            </button>
            
            <button
              className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-700"
              onClick={() => toast.notify.subtle("복사되었습니다", { isDark: isDarkMode })}
            >
              비방해성 정보 (bottom-right)
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">위치 커스텀</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            onClick={() => toast.success("상단 오른쪽 토스트", { position: "top-right", isDark: isDarkMode })}
          >
            상단 오른쪽
          </button>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            onClick={() => toast.success("상단 중앙 토스트", { position: "top-center", isDark: isDarkMode })}
          >
            상단 중앙
          </button>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            onClick={() => toast.success("하단 오른쪽 토스트", { position: "bottom-right", isDark: isDarkMode })}
          >
            하단 오른쪽
          </button>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            onClick={() => toast.success("하단 중앙 토스트", { position: "bottom-center", isDark: isDarkMode })}
          >
            하단 중앙
          </button>
        </div>
      </div>
    </div>
  );
} 