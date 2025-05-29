"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

// 비품 아이템 타입: 이용 가능 수량 필드 추가
interface Item {
  id: number;
  name: string;
  isReturnRequired: boolean;
  availableQuantity: number;
}

export default function SupplyRequestItemCreatePage() {
  const router = useRouter();
  const params = useParams();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { loginUser, isLogin } = useGlobalLoginUser();
  const toast = useCustomToast();
  const prefillId = params.id ? Number(params.id) : null;

  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin || !loginUser) return null;
  const user = loginUser as any;

  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rental, setRental] = useState(false);
  const [useDate, setUseDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [purpose, setPurpose] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1) 전체 ACTIVE 품목 로드
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/items/active`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: { content?: Item[] } | Item[]) => {
        const list = Array.isArray(data) ? data : data.content || [];
        setItems(list);

        // prefill
        if (prefillId != null) {
          const match = list.find((it) => it.id === prefillId);
          if (match) {
            setSelectedItem(match);
            setSearch(match.name);
            setShowDropdown(false);
          }
        }
      })
      .catch(() => setItems([]));
  }, [API_BASE, prefillId]);

  // 2) 검색어 변경 시 필터링
  useEffect(() => {
    const f = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setShowDropdown(f.length > 0 && search.trim() !== "");
  }, [items, search]);

  // 3) 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 4) 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      return toast.error("항목을 선택해주세요.");
    }
    // **이용 가능 수량 검증**
    if (quantity > selectedItem.availableQuantity) {
      return toast.error("이용 가능한 수량보다 높습니다.");
    }
    if (quantity < 1) {
      return toast.error("수량을 확인해주세요.");
    }
    if (!purpose.trim()) {
      return toast.error("목적을 입력해주세요.");
    }
    if (rental && !selectedItem.isReturnRequired) {
      return toast.error("대여 비품이 아닙니다.");
    }

    const payload = {
      itemId: selectedItem.id,
      quantity,
      rental,
      useDate: `${useDate}T00:00:00`,
      returnDate: rental ? `${returnDate}T00:00:00` : null,
      purpose,
    };

    const res = await fetch(`${API_BASE}/api/v1/supply-requests`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text();
      return toast.error(`등록 실패: ${msg}`);
    }
    toast.success("등록 완료");
    router.push("/item/supplyrequest/list/user");
  };

  return (
    <main className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm">
        {/* 헤더 섹션 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 비품 요청</h1>
              <p className="mt-1 text-sm text-gray-500">
                필요한 비품을 요청해주세요.
              </p>
            </div>
            <Link
              href="/item/user"
              className="inline-flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              목록으로
            </Link>
          </div>
        </div>

        {/* 폼 섹션 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 요청자 */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청자
              </label>
              <input
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                value={user.name}
                disabled
              />
            </div>

            {/* 품목 검색 */}
            <div ref={wrapperRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                품목 검색
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="검색어를 입력하세요"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedItem(null);
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              {showDropdown && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {filtered.map((item) => (
                    <li
                      key={item.id}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedItem(item);
                        setSearch(item.name);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        이용 가능: {item.availableQuantity}개
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 수량 / 대여 여부 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수량{" "}
                  <span className="text-sm text-gray-500">
                    (최대 {selectedItem?.availableQuantity ?? "-"})
                  </span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={1}
                  max={selectedItem?.availableQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(+e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대여 여부
                </label>
                <div className="flex gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={rental}
                      onChange={() => setRental(true)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">예</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={!rental}
                      onChange={() => setRental(false)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">아니요</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 날짜 선택 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 일자
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={useDate}
                  onChange={(e) => setUseDate(e.target.value)}
                />
              </div>
              {rental && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반납 일자
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* 요청 사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청 사유
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="요청 사유를 입력해주세요"
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-3 bg-[#0047AB] hover:bg-[#003d91] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB]"
            >
              요청하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
