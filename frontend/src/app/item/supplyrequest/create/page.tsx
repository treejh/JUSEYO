"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

// 비품 아이템 타입에 반환 요구 여부 필드 추가
interface Item {
  id: number;
  name: string;
  isReturnRequired: boolean;
}

export default function SupplyRequestCreatePage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 로그인 보장
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);

  if (!isLogin || !loginUser) return null;
  const user = loginUser as any;

  // 상태
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [rental, setRental] = useState(false);
  const [useDate, setUseDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [purpose, setPurpose] = useState("");
  const toast = useCustomToast();

  // 전체 ACTIVE 품목 로드
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/items/active`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setItems(data.content || data))
      .catch(() => setItems([]));
  }, [API_BASE]);

  // 검색어 변경 시 필터링 (대여 여부 무관)
  useEffect(() => {
    const f = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setShowDropdown(f.length > 0 && search.trim() !== "");
  }, [items, search]);

  // 외부 클릭 시 드롭다운 닫기
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return toast.error("항목을 선택해주세요.");
    if (quantity < 1) return toast.error("수량을 확인해주세요.");
    if (!purpose.trim()) return toast.error("목적을 입력해주세요.");

    // 대여 여부에 따른 필수 반환 요구 체크
    if (rental && !selectedItem.isReturnRequired) {
      return toast.error("대여 비품이 아닙니다");
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
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">새 비품 요청</h1>
          <Link href="/item/supplyrequest/list/user" className="text-blue-500">
            ← 목록
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1">요청자</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={user.name}
              disabled
            />
          </div>
          <div ref={wrapperRef} className="relative">
            <label className="block mb-1">품목 검색</label>
            <input
              className="w-full px-3 py-2 border rounded"
              placeholder="검색어를 입력하세요"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedItem(null);
              }}
            />
            {showDropdown && (
              <ul className="absolute top-full w-full bg-white border rounded mt-1 max-h-40 overflow-auto z-10">
                {filtered.map((item) => (
                  <li
                    key={item.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedItem(item);
                      setSearch(item.name);
                      setShowDropdown(false);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">수량</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1">대여 여부</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={rental}
                    onChange={() => setRental(true)}
                    className="mr-2"
                  />
                  예
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!rental}
                    onChange={() => setRental(false)}
                    className="mr-2"
                  />
                  아니요
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">사용 일자</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                value={useDate}
                onChange={(e) => setUseDate(e.target.value)}
              />
            </div>
            {rental && (
              <div>
                <label className="block mb-1">반납 일자</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1">요청 사유</label>
            <textarea
              className="w-full px-3 py-2 border rounded h-24"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            요청하기
          </button>
        </form>
      </div>
    </main>
  );
}
