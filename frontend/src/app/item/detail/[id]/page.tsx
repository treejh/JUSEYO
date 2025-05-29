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
  // 백엔드의 is_return_required 컬럼과 매핑
  isReturnRequired: boolean;
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

  // 1) 제품 정보 로드
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
        // 날짜만 yyyy-MM-dd
        data.createdAt = data.createdAt.slice(0, 10);
        setProduct(data);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id, isLogin, router]);

  // 2) 출고/입고 내역 로드
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

  // 로딩/에러 화면
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
    <div className="flex flex-col lg:flex-row p-4 gap-6 bg-gray-50 min-h-screen">
      {/* 좌측: 제품 상세 정보 + 이미지 */}
      <div className="flex-1 bg-white rounded-xl shadow p-6">
        <div className="flex gap-8">
          {/* 제품 정보 */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">제품 상세 정보</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
              <div className="font-medium">제품명</div>
              <div>{product.name}</div>
              <div className="font-medium">고유번호</div>
              <div>{product.serialNumber}</div>
              <div className="font-medium">총 보유수량</div>
              <div>{product.totalQuantity}개</div>
              <div className="font-medium">이용 가능 수량</div>
              <div>{product.availableQuantity}개</div>

              {/* 대여 품목인 경우에만 ‘대여 중’ 표시 */}
              {product.isReturnRequired && (
                <>
                  <div className="font-medium">대여 중</div>
                  <div>
                    {product.totalQuantity - product.availableQuantity}개
                  </div>
                </>
              )}

              <div className="font-medium">대여 여부</div>
              <div>{product.isReturnRequired ? "대여" : "비대여"}</div>
              <div className="font-medium">위치</div>
              <div>{product.location}</div>
              <div className="font-medium">등록일</div>
              <div>{product.createdAt}</div>
              <div className="font-medium">구매처</div>
              <div>{product.buyer}</div>
            </div>
          </div>
          {/* 제품 이미지 */}
          <div className="w-80 flex flex-col items-center">
            <div className="bg-gray-50 rounded-lg p-4 w-full h-80">
              <img
                src={imgSrc}
                alt={product.name}
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).src = placeholder)
                }
                className="w-full h-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 우측: 재고 현황 + 입·출고 내역 */}
      <div className="w-full lg:w-80 bg-white rounded-xl shadow p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">재고 현황</h2>
        <div className="space-y-4 mb-6">
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

        {/* 탭 */}
        <div className="flex mb-4 bg-gray-100 rounded">
          {(["출고", "입고"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium transition ${
                tab === t
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 내역 리스트 */}
        <div className="overflow-auto flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {tab === "출고"
                ? "출고 내역이 없습니다."
                : "입고 내역이 없습니다."}
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded"
                >
                  <div className="text-sm text-gray-700">
                    {formatMonthDay(h.createdAt)}
                  </div>
                  <div
                    className={`font-bold ${
                      tab === "출고" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {tab === "출고" ? "-" : "+"}
                    {Math.abs(h.quantity)}개 {tab}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
