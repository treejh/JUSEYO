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
  serialNumber: string;
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
    serialNumber: "",
    purchaseSource: "",
    location: "",
    isReturnRequired: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  // 이미지 미리보기
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 카테고리 로드
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories`, {
      credentials: "include",
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject("카테고리 로드 실패")
      )
      .then((data: Category[]) => setCategories(data))
      .catch((err) => alert(err));
  }, []);

  // input / checkbox / file / select 모두 처리
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
          type === "number"
            ? Number(value)
            : name === "categoryId"
            ? Number(value)
            : value,
      }));
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 유효성 검사
    if (form.totalQuantity < form.minimumQuantity) {
      alert("총수량은 최소수량 이상이어야 합니다.");
      return;
    }
    if (form.availableQuantity > form.totalQuantity) {
      alert("사용가능수량은 총수량 이하여야 합니다.");
      return;
    }

    // multipart/form-data 로 전송
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, String(v)));
    if (file) body.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/items`,
        {
          method: "POST",
          credentials: "include",
          body,
        }
      );
      if (!res.ok) {
        const msg = await res.text();
        alert(`등록 실패: ${msg}`);
        return;
      }
      alert("신규 비품이 성공적으로 등록되었습니다.");
      router.push("/item/manage");
    } catch (error: any) {
      alert(`서버 오류: ${error.message}`);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <h1 className="text-xl mb-4">신규 비품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* 수량 필드 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">최소수량</label>
            <input
              name="minimumQuantity"
              type="number"
              min={0}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              value={form.minimumQuantity}
            />
          </div>
          <div>
            <label className="block mb-1">총수량</label>
            <input
              name="totalQuantity"
              type="number"
              min={0}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              value={form.totalQuantity}
            />
          </div>
          <div>
            <label className="block mb-1">사용가능수량</label>
            <input
              name="availableQuantity"
              type="number"
              min={0}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              value={form.availableQuantity}
            />
          </div>
          <div>
            <label className="block mb-1">시리얼번호</label>
            <input
              name="serialNumber"
              type="text"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              value={form.serialNumber}
            />
          </div>
        </div>

        {/* 구매처, 위치, 반납필수 여부 */}
        <div>
          <label className="block mb-1">구매처</label>
          <input
            name="purchaseSource"
            type="text"
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            value={form.purchaseSource}
          />
        </div>

        <div>
          <label className="block mb-1">보관위치</label>
          <input
            name="location"
            type="text"
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            value={form.location}
          />
        </div>

        <div className="flex items-center">
          <input
            name="isReturnRequired"
            type="checkbox"
            onChange={handleChange}
            className="mr-2"
            checked={form.isReturnRequired}
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
