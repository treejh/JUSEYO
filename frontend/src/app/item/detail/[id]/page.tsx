"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface Product {
  id: number;
  name: string;
  serialNumber: string;
  totalQuantity: number;
  availableQuantity: number;
  rental: boolean;
  location: string;
  createdAt: string;
  buyer: string;
  image?: string;
}

interface InventoryMoveDto {
  itemId: number;
  quantity: number;
  createdAt: string;
}

type Tab = "출고" | "입고";

export default function ItemDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isLogin } = useGlobalLoginUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("출고");
  const [inRecords, setInRecords] = useState<InventoryMoveDto[]>([]);
  const [outRecords, setOutRecords] = useState<InventoryMoveDto[]>([]);

  useEffect(() => {
    if (!isLogin) {
      router.push("/login");
      return;
    }
    if (!id) return;

    setLoading(true);
    fetch(`${API_BASE}/api/v1/items/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("제품 정보를 불러올 수 없습니다.");
        return res.json() as Promise<Product>;
      })
      .then((data) => {
        data.createdAt = data.createdAt.slice(0, 10);
        setProduct(data);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id, isLogin, router]);

  useEffect(() => {
    if (!id) return;

    // 전체 출고 내역에서 해당 itemId만 조회
    fetch(
      `${API_BASE}/api/v1/inventory-out?itemId=${id}&size=100&sortField=createdAt&sortDir=desc`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("출고 내역을 불러올 수 없습니다.");
        return res.json() as Promise<{ content: InventoryMoveDto[] }>;
      })
      .then(({ content }) => {
        setOutRecords(
          content.map((r) => ({
            ...r,
            createdAt: r.createdAt.slice(0, 10),
          }))
        );
      })
      .catch(() => {});

    // 입고 내역 (by-item)
    fetch(
      `${API_BASE}/api/v1/inventory-in/by-item?itemId=${id}&page=1&size=100&sort=createdAt,desc`,
      { credentials: "include" }
    )
      .then((res) => {
        if (!res.ok) throw new Error("입고 내역을 불러올 수 없습니다.");
        return res.json() as Promise<{ content: InventoryMoveDto[] }>;
      })
      .then(({ content }) => {
        setInRecords(
          content.map((r) => ({
            ...r,
            createdAt: r.createdAt.slice(0, 10),
          }))
        );
      })
      .catch(() => {});
  }, [id]);

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

  const formatMonthDay = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const placeholder = "/no-image.png";
  const imgSrc = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `${API_BASE}${product.image}`
    : placeholder;

  const history = tab === "출고" ? outRecords : inRecords;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          목록으로 돌아가기
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 좌측: 제품 이미지 */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={imgSrc}
                  alt={product.name}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = placeholder)}
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </div>
          </div>

          {/* 우측: 제품 정보 */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-gray-500">{product.serialNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  product.availableQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.availableQuantity > 0 ? '대여가능' : '대여불가'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-500 mb-1">총 보유수량</div>
                  <div className="text-2xl font-bold text-gray-900">{product.totalQuantity}개</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-500 mb-1">이용 가능수량</div>
                  <div className="text-2xl font-bold text-blue-600">{product.availableQuantity}개</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-sm text-gray-500">대여 여부</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.rental ? "대여" : "비대여"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">보관 위치</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.location}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">등록일</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.createdAt}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">구매처</dt>
                    <dd className="mt-1 text-sm text-gray-900">{product.buyer}</dd>
                  </div>
                </dl>
              </div>

              {product.availableQuantity > 0 && (
                <div className="mt-8">
                  <button
                    onClick={() => router.push(`/item/supplyrequest/create/${product.id}`)}
                    className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    비품 요청하기
                  </button>
                </div>
              )}
            </div>

            {/* 입출고 내역 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">입출고 내역</h2>
              
              {/* 탭 */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                {(["출고", "입고"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      tab === t
                        ? "bg-white text-blue-600 shadow"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t} 내역
                  </button>
                ))}
              </div>

              {/* 내역 리스트 */}
              <div className="overflow-auto max-h-[400px]">
                {history.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    {tab === "출고" ? "출고 내역이 없습니다." : "입고 내역이 없습니다."}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {history.map((h, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center py-4 hover:bg-gray-50 px-4 rounded-lg"
                      >
                        <div className="text-sm text-gray-600">
                          {formatMonthDay(h.createdAt)}
                        </div>
                        <div className={`font-medium ${
                          tab === "출고" ? "text-red-600" : "text-green-600"
                        }`}>
                          {tab === "출고" ? "-" : "+"}
                          {Math.abs(h.quantity)}개
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
