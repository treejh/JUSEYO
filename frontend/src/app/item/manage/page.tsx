"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Item {
  id: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  availableQuantity: number;
  purchaseSource?: string;
  location?: string;
  serialNumber?: string;
  status: string;
  image?: string; // 이미지 URL
  createdAt: string;
  modifiedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function AllItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/all`, {
        credentials: "include",
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`서버 오류: ${msg}`);
      }
      const data: Item[] = await res.json();
      setItems(data.filter((item) => item.status === "ACTIVE"));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAllItems();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto w-full max-w-7xl bg-white p-8 shadow-lg rounded-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">전체 비품 목록</h1>
          <Link
            href="/items"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            돌아가기
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-300">
              <tr>
                <th className="px-3 py-2 border text-center">#</th>
                <th className="px-3 py-2 border text-center">Item ID</th>
                <th className="px-3 py-2 border">이미지</th>
                <th className="px-3 py-2 border">이름</th>
                <th className="px-3 py-2 border">카테고리</th>
                <th className="px-3 py-2 border">위치</th>
                <th className="px-3 py-2 border">구매처</th>
                <th className="px-3 py-2 border">시리얼넘버</th>
                <th className="px-3 py-2 border text-center">총수량</th>
                <th className="px-3 py-2 border text-center">잔여수량</th>
                <th className="px-3 py-2 border">생성일</th>
                <th className="px-3 py-2 border">수정일</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border hover:bg-gray-50">
                  <td className="px-3 py-2 border text-center">{idx + 1}</td>
                  <td className="px-3 py-2 border text-center">{item.id}</td>
                  <td className="px-3 py-2 border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border">{item.name}</td>
                  <td className="px-3 py-2 border">{item.categoryName}</td>
                  <td className="px-3 py-2 border">{item.location ?? "-"}</td>
                  <td className="px-3 py-2 border">
                    {item.purchaseSource ?? "-"}
                  </td>
                  <td className="px-3 py-2 border">
                    {item.serialNumber ?? "-"}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {item.totalQuantity}
                  </td>
                  <td className="px-3 py-2 border text-center">
                    {item.availableQuantity}
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border">
                    {new Date(item.modifiedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
