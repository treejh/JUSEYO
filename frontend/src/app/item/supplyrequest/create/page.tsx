"use client";

import React, { useState, FormEvent, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

// 로그인 유저 타입
interface CustomUser {
  username: string;
  departmentName: string;
  [key: string]: any;
}

// 자동완성용 아이템 타입
interface Item {
  id: number;
  name: string;
}

export default function SupplyRequestCreatePage() {
  const router = useRouter();
  const { loginUser, isLogin } = useGlobalLoginUser();

  // 로그인 체크 및 리디렉트
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  const user = loginUser as CustomUser;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  // 폼 상태
  const [productName, setProductName] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [rental, setRental] = useState<boolean>(false);
  const [useDate, setUseDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [purpose, setPurpose] = useState<string>("");

  // 자동완성 상태
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 아이템 목록 로드
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/items?status=AVAILABLE&page=0&size=100`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const list: any[] = Array.isArray(data) ? data : data.content ?? [];
        setItems(
          list.map((i) => ({ id: i.id, name: i.name || i.productName }))
        );
      })
      .catch(() => setItems([]));
  }, [API_BASE]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // 자동완성 입력 핸들러
  const handleProductChange = (val: string) => {
    setProductName(val);
    setSelectedItemId(null);
    if (!val.trim()) {
      setFilteredItems([]);
      setShowDropdown(false);
      return;
    }
    const filtered = items.filter((i) =>
      i.name.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredItems(filtered);
    setShowDropdown(filtered.length > 0);
  };

  // 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (selectedItemId === null) {
      alert("비품을 선택하세요.");
      return;
    }
    if (rental && !returnDate) {
      alert("대여 시 반납 날짜를 입력하세요.");
      return;
    }
    if (!purpose.trim()) {
      alert("사유를 입력하세요.");
      return;
    }

    const payload = {
      itemId: selectedItemId,
      quantity,
      rental,
      useDate: `${useDate}T00:00:00`,
      returnDate: rental ? `${returnDate}T00:00:00` : undefined,
      purpose: purpose.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `요청 실패 (${res.status})`);
      }
      alert("비품 요청이 등록되었습니다.");
      router.push("/item/supplyrequest/list");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">비품 요청서</h1>
          <Link href="/item/supplyrequest/list">
            <button className="border px-4 py-2 rounded-lg hover:bg-gray-50">
              ← 목록으로
            </button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* 기본 정보 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700">요청자</label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* 비품 정보 */}
          <section ref={wrapperRef}>
            <h2 className="text-xl font-semibold mb-4">비품 정보</h2>
            <div className="grid grid-cols-2 gap-6 relative">
              <div>
                <label className="block mb-2 text-gray-700">품목명</label>
                <input
                  type="text"
                  placeholder="품목명을 입력하세요"
                  value={productName}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {showDropdown && (
                  <ul className="absolute w-full bg-white border rounded-lg max-h-48 overflow-auto z-10 p-0 mt-1">
                    {filteredItems.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setProductName(item.name);
                          setSelectedItemId(item.id);
                          setShowDropdown(false);
                        }}
                      >
                        {item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block mb-2 text-gray-700">수량</label>
                <div className="inline-flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 border rounded-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(e) =>
                      setQuantity(Math.max(1, Number(e.target.value)))
                    }
                    className="w-16 text-center border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 border rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700">대여 여부</label>
                <div className="flex items-center space-x-4">
                  <label>
                    <input
                      type="radio"
                      checked={rental}
                      onChange={() => setRental(true)}
                      className="mr-2"
                    />
                    예
                  </label>
                  <label>
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

              {rental && (
                <div>
                  <label className="block mb-2 text-gray-700">반납 일자</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>
          </section>

          {/* 요청 사유 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">요청 사유</h2>
            <textarea
              placeholder="요청 목적을 입력하세요"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 h-40 border rounded-lg resize-none"
            />
          </section>

          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              제출하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
