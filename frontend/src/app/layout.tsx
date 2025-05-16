// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./ClientLayout"; // 👈 Header 컴포넌트 불러오기

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ 아이콘 및 메타 설정
export const metadata: Metadata = {
  title: "JUSEYO",
  description: "재고 관리 플랫폼 JUSEYO",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
