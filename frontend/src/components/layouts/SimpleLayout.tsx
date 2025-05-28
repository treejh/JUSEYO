"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface SimpleLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function SimpleLayout({ children, title }: SimpleLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          돌아가기
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
} 