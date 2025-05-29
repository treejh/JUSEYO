"use client";

import Link from "next/link";
import Image from "next/image";
import LoadingScreen from "@/app/components/LoadingScreen";
import { useState } from "react";

export default function ChatSelectPage() {
  const [loading, setLoading] = useState(false);

  const cards = [
    {
      href: "/chat/group",
      title: "그룹 채팅",
      desc: "여러 사람과 함께 소통해보세요.",
      image: "https://juseyo.s3.ap-northeast-2.amazonaws.com/dan.png", // 그룹 채팅 느낌의 아이콘
      bg: "bg-white hover",
    },
    {
      href: "/chat/user",
      title: "1:1 채팅",
      desc: "개인적인 대화를 나눠보세요.",
      image: "https://juseyo.s3.ap-northeast-2.amazonaws.com/one2.png", // 1:1 채팅 느낌의 아이콘
      bg: "bg-white hover",
    },
    {
      href: "/chat/support",
      title: "고객 지원 채팅",
      desc: "문의사항을 실시간으로 해결해보세요.",
      image: "https://juseyo.s3.ap-northeast-2.amazonaws.com/user2.png", // 고객지원 느낌의 아이콘
      bg: "bg-white hover",
    },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 px-4 flex flex-col items-center overflow-auto">
      <div className="flex flex-col items-center justify-center w-full mt-65">
        <div className="max-w-4xl mx-auto text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            채팅 유형을 선택하세요
          </h1>
          <p className="text-gray-600 mt-2">상황에 맞는 채팅을 골라보세요.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 justify-items-center w-full">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`w-full max-w-xs rounded-2xl shadow-md p-4 flex flex-col items-center text-center transition-transform hover:scale-105 ${card.bg}`}
            >
              <div className="w-16 h-16 mb-2 relative">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {card.title}
              </h2>
              <p className="text-sm text-gray-600">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
