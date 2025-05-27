// app/item/detail/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface Product {
  id: number;
  name: string;
  serialNumber: string;
  total_quantity: number;
  available_quantity: number;
  location: string;
  createdAt: string;
  buyer: string;
  image?: string;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isLogin } = useGlobalLoginUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
      return;
    }
    if (!id) return;

    setLoading(true);
    fetch(`${API_BASE}/api/v1/items/${id}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("제품 정보를 불러올 수 없습니다.");
        return res.json() as Promise<Product>;
      })
      .then((data) => {
        const createdDate = data.createdAt.slice(0, 10);
        setProduct({ ...data, createdAt: createdDate });
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id, isLogin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <span className="text-red-600">
          {error || "제품을 찾을 수 없습니다."}
        </span>
      </div>
    );
  }

  const placeholder = "/no-image.png";
  const imgSrc = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${API_BASE}${product.image}`
    : placeholder;

  return (
    <div className="flex flex-col lg:flex-row p-4 gap-6 bg-gray-50 min-h-screen">
      {/* 좌측: 제품 상세 정보 */}
      <div className="flex-1 bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">제품 상세 정보</h2>
        <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
          <div className="font-medium">제품명</div>
          <div>{product.name}</div>

          <div className="font-medium">고유번호</div>
          <div>{product.serialNumber}</div>

          <div className="font-medium">총 보유수량</div>
          <div>{product.total_quantity}개</div>

          <div className="font-medium">이용 가능 수량</div>
          <div>{product.available_quantity}개</div>

          <div className="font-medium">위치</div>
          <div>{product.location}</div>

          <div className="font-medium">등록일</div>
          <div>{product.createdAt}</div>

          <div className="font-medium">구매처</div>
          <div>{product.buyer}</div>
        </div>

        <div className="mt-6 flex justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = placeholder;
            }}
            className="w-64 h-64 object-contain rounded"
          />
        </div>
      </div>

      {/* 우측: 재고 현황 */}
      <div className="w-full lg:w-80 bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">재고 현황</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600">총 보유 수량</div>
            <div className="text-3xl font-bold text-blue-600">
              {product.totalQuantity}개
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">이용 가능 수량</div>
            <div className="text-3xl font-bold text-green-600">
              {product.availableQuantity}개
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
