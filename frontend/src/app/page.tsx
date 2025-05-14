import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">JUSEYO</h1>
      <p className="text-lg mb-8">프로젝트에 오신 것을 환영합니다!</p>
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-600">
          기본 템플릿입니다. src/app/page.tsx 파일을 수정하여 시작하세요.
        </p>
      </div>
    </div>
  );
}
