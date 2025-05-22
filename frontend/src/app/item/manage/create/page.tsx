"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
}

interface FormState {
  name: string;
  categoryId: number;
  minimumQuantity: number;
  totalQuantity: number;
  availableQuantity: number;
  purchaseSource: string;
  location: string;
  isReturnRequired: boolean;
}

export default function CreateItemPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    categoryId: 0,
    minimumQuantity: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    purchaseSource: "",
    location: "",
    isReturnRequired: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  // --- 카테고리 로드 ---
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories`, {
      credentials: "include",
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject("카테고리 로드 실패")
      )
      .then((data: Category[]) => setCategories(data))
      .catch(alert);
  }, []);

  // --- 이미지 미리보기 ---
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // --- input / select / checkbox / file 공통 핸들러 ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked, files } = e.target as HTMLInputElement;

    if (type === "file") {
      setFile(files?.[0] ?? null);
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({
        ...f,
        [name]:
          type === "number" || name === "categoryId" ? Number(value) : value,
      }));
    }
  };

  // --- 폼 제출 ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 간단 검증
    if (form.totalQuantity < form.minimumQuantity) {
      return alert("총수량은 최소수량 이상이어야 합니다.");
    }
    if (form.availableQuantity > form.totalQuantity) {
      return alert("사용가능수량은 총수량 이하여야 합니다.");
    }

    // FormData 로 묶기
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, String(v)));
    if (file) body.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/items`,
        {
          method: "POST",
          credentials: "include",
          body, // Content-Type 헤더는 자동으로 multipart/form-data; boundary=… 로 설정됩니다
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        return alert(`등록 실패: ${msg}`);
      }

      alert("신규 비품이 성공적으로 등록되었습니다.");
      router.push("/item/manage");
    } catch (err: any) {
      alert(`서버 오류: ${err.message}`);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-xl mb-4">신규 비품 등록</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        // 이 `<form>` 태그에 encType 지정 안 해도 fetch 사용 시 FormData 로 전송됩니다
      >
        {/* 이미지 업로드 */}
        <div>
          <label className="block mb-1">이미지</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="block"
          />
          {preview && (
            <Image
              src={preview}
              alt="Preview"
              width={128}
              height={128}
              className="mt-2 rounded"
            />
          )}
        </div>

        {/* 상품명 */}
        <div>
          <label className="block mb-1">상품명</label>
          <input
            name="name"
            type="text"
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
            value={form.name}
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block mb-1">카테고리</label>
          <select
            name="categoryId"
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
            value={form.categoryId}
          >
            <option value={0}>선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 수량 입력 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">최소수량</label>
            <input
              name="minimumQuantity"
              type="number"
              min={0}
              onChange={handleChange}
              value={form.minimumQuantity}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">총수량</label>
            <input
              name="totalQuantity"
              type="number"
              min={0}
              onChange={handleChange}
              value={form.totalQuantity}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">사용가능수량</label>
            <input
              name="availableQuantity"
              type="number"
              min={0}
              onChange={handleChange}
              value={form.availableQuantity}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* 구매처 */}
        <div>
          <label className="block mb-1">구매처</label>
          <input
            name="purchaseSource"
            type="text"
            onChange={handleChange}
            value={form.purchaseSource}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* 보관 위치 */}
        <div>
          <label className="block mb-1">보관위치</label>
          <input
            name="location"
            type="text"
            onChange={handleChange}
            value={form.location}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* 반납 필수 여부 */}
        <div className="flex items-center">
          <input
            name="isReturnRequired"
            type="checkbox"
            onChange={handleChange}
            checked={form.isReturnRequired}
            className="mr-2"
          />
          <label>반납 필수 여부</label>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          등록하기
        </button>
      </form>
    </main>
  );
}
