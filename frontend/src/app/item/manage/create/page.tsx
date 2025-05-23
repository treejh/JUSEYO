"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
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
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameExists, setNameExists] = useState(false);

  // 1) 카테고리 로드
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/categories`, { credentials: "include" })
      .then((res) =>
        res.ok ? res.json() : Promise.reject("카테고리 로드 실패")
      )
      .then((data: Category[]) => setCategories(data))
      .catch(alert);
  }, [API_BASE]);

  // 2) 이미지 미리보기
  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 3) 공통 변경 핸들러
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

  // 4) 상품명 중복 확인 (onBlur)
  const checkName = async () => {
    if (!form.name.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/items/exists?name=${encodeURIComponent(form.name)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("중복 체크 실패");
      const { exists } = (await res.json()) as { exists: boolean };
      setNameExists(exists);
    } catch {
      // 실패해도 폼 자체는 막지 않음
    }
  };

  // 5) 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 5.1) 중복 방지
    if (nameExists) {
      return alert("이미 등록된 이름입니다. 다른 이름을 입력하세요.");
    }
    // 5.2) 로직 검증
    if (form.totalQuantity < form.minimumQuantity) {
      return alert("총수량은 최소수량 이상이어야 합니다.");
    }
    if (form.availableQuantity > form.totalQuantity) {
      return alert("사용 가능 수량은 총수량 이하여야 합니다.");
    }

    // 5.3) FormData
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, String(v)));
    if (file) body.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/api/v1/items`, {
        method: "POST",
        credentials: "include",
        body,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "등록 실패");
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이미지 업로드 영역 수정 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            이미지
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {preview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-1 text-xs text-gray-500">이미지 없음</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="w-5 h-5 mr-2 -ml-1 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                이미지 업로드
              </label>
              <input
                id="file-upload"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="sr-only"
              />
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF 최대 10MB
              </p>
            </div>
          </div>
        </div>

        {/* 상품명 */}
        <div>
          <label className="block mb-1">상품명</label>
          <input
            name="name"
            type="text"
            onChange={handleChange}
            onBlur={checkName}
            value={form.name}
            required
            className={`w-full border rounded px-2 py-1 ${
              nameExists ? "border-red-500" : ""
            }`}
          />
          {nameExists && (
            <p className="mt-1 text-sm text-red-600">
              동일한 이름의 비품이 이미 존재합니다.
            </p>
          )}
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block mb-1">카테고리</label>
          <select
            name="categoryId"
            onChange={handleChange}
            value={form.categoryId}
            required
            className="w-full border rounded px-2 py-1"
          >
            <option value={0}>선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 수량 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">최소수량</label>
            <input
              name="minimumQuantity"
              type="number"
              min={0}
              value={form.minimumQuantity}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">총수량</label>
            <input
              name="totalQuantity"
              type="number"
              min={0}
              value={form.totalQuantity}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1">사용가능수량</label>
            <input
              name="availableQuantity"
              type="number"
              min={0}
              value={form.availableQuantity}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* 구매처/위치/반납 */}
        <div>
          <label className="block mb-1">구매처</label>
          <input
            name="purchaseSource"
            type="text"
            value={form.purchaseSource}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block mb-1">보관 위치</label>
          <input
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center">
          <input
            name="isReturnRequired"
            type="checkbox"
            checked={form.isReturnRequired}
            onChange={handleChange}
            className="mr-2"
          />
          <label>반납 필수 여부</label>
        </div>

        {/* 버튼 영역 수정 */}
        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/item/manage"
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            돌아가기
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            등록하기
          </button>
        </div>
      </form>
    </main>
  );
}
