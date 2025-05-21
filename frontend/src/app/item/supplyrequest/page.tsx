"use client";

// app/supplyrequests/page.tsx
// ➜ reason → purpose 로 필드명 일치 / purpose 필수 검사 추가

import React, { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  name: string;
}

interface SupplyRequestForm {
  itemId: number | null;
  quantity: number;
  rental: boolean;
  returnDate: string;
  purpose: string; // 사유 필드
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function SupplyRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState<SupplyRequestForm>({
    itemId: null,
    quantity: 1,
    rental: false,
    returnDate: "",
    purpose: "",
  });
  const [items, setItems] = useState<Item[]>([]);
  const [showList, setShowList] = useState(false);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  /* ─── 검색 ─────────────────────────────────────────────── */
  const searchItems = async (kw: string) => {
    if (kw.trim().length < 2) return setItems([]);

    const url = new URL("/api/v1/items", API_BASE || window.location.origin);
    url.searchParams.set("keyword", kw);
    url.searchParams.set("status", "AVAILABLE");
    url.searchParams.set("page", "0");
    url.searchParams.set("size", "10");

    try {
      console.log("GET", url.toString());
      const res = await fetch(url.toString(), {
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("검색 실패", res.status, text);
        throw new Error(text || `검색 실패 (${res.status})`);
      }
      const data = await res.json();
      const list: Item[] = Array.isArray(data) ? data : data.content ?? [];
      setItems(list);
      setShowList(true);
    } catch (e) {
      alert("비품 검색에 실패했습니다.");
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => searchItems(v), 300);
  };

  /* ─── 입력 ─────────────────────────────────────────────── */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let v: any = value;
    if (type === "number") v = Number(value);
    setForm((prev) => ({ ...prev, [name]: v }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === "rental" && !checked ? { returnDate: "" } : {}),
    }));
  };

  /* ─── 제출 ─────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemId) return alert("비품을 선택하세요.");
    if (form.rental && !form.returnDate)
      return alert("대여 시 반납 날짜를 입력하세요.");
    if (!form.purpose.trim()) return alert("사유를 입력하세요.");

    const payload = {
      itemId: form.itemId,
      quantity: form.quantity,
      rental: form.rental,
      returnDate: form.returnDate || undefined,
      purpose: form.purpose.trim(),
    };

    console.log("POST", payload);

    try {
      const res = await fetch(`${API_BASE}/api/v1/supply-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("요청 실패", res.status, txt);
        throw new Error(txt || "요청 실패");
      }
      alert("비품 요청이 등록되었습니다.");
      router.push("/item");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  /* ─── UI ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl rounded-lg bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-3xl font-bold text-center">비품 요청서</h1>

        {/* 비품 검색 */}
        <label className="block mb-2 font-medium">비품 이름 검색</label>
        <input
          type="text"
          name="search"
          onChange={handleSearchChange}
          placeholder="비품 이름을 입력하세요"
          className="mb-2 w-full rounded border px-3 py-2 outline-none focus:ring"
        />
        {showList && items.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow">
            {items.map((it) => (
              <li
                key={it.id}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setForm((p) => ({ ...p, itemId: it.id }));
                  (
                    document.querySelector(
                      "input[name=search]"
                    ) as HTMLInputElement
                  ).value = it.name;
                  setShowList(false);
                }}
              >
                {it.name}
              </li>
            ))}
          </ul>
        )}

        {/* 수량 */}
        <label className="block mt-4 mb-2 font-medium">수량</label>
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          min={1}
          onChange={handleInputChange}
          className="w-full rounded border px-3 py-2 outline-none focus:ring"
        />

        {/* 대여 여부 */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="checkbox"
            name="rental"
            checked={form.rental}
            onChange={handleCheckboxChange}
            className="h-5 w-5"
          />
          <span className="font-medium">대여</span>
        </div>

        {/* 반납 날짜 */}
        {form.rental && (
          <>
            <label className="block mt-4 mb-2 font-medium">반납 날짜</label>
            <input
              type="date"
              name="returnDate"
              value={form.returnDate}
              onChange={handleInputChange}
              className="w-full rounded border px-3 py-2 outline-none focus:ring"
            />
          </>
        )}

        {/* 사유 */}
        <label className="block mt-4 mb-2 font-medium">사유</label>
        <textarea
          name="purpose"
          value={form.purpose}
          onChange={handleInputChange}
          rows={4}
          placeholder="요청 사유를 입력하세요"
          className="w-full rounded border px-3 py-2 outline-none focus:ring"
        />

        <button
          type="submit"
          className="mt-6 w-full rounded bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          제출
        </button>
      </form>
    </div>
  );
}
