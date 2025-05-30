"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCustomToast } from "@/utils/toast";

interface Category {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  categoryId: number;
  minimumQuantity: number;
  totalQuantity: number;
  availableQuantity: number;
  purchaseSource?: string;
  location?: string;
  serialNumber?: string;
  isReturnRequired: boolean;
  managementId: number;
  status: string;
  image?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function EditItemPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>()!;
  const toast = useCustomToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // 1) Load categories
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/categories`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Category[]) => setCategories(data))
      .catch(() => toast.error("카테고리 로드 실패"));
  }, []);

  // 2) Load item
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/v1/items/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Item) => {
        setItem(data);
        setPreview(data.image ?? "");
      })
      .catch(() => {
        toast.error("데이터 로딩 중 오류가 발생했습니다.");
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  // preview for newly selected file
  useEffect(() => {
    if (!newFile) return;
    const url = URL.createObjectURL(newFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!item) return;
    const { name, type, value, checked, files } = e.target as HTMLInputElement;
    if (type === "file") {
      setNewFile(files?.[0] ?? null);
    } else {
      setItem({
        ...item,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number" ||
              name === "categoryId" ||
              name === "managementId"
            ? Number(value)
            : value,
      } as Item);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setSaving(true);

    // 항상 FormData로 전송
    const form = new FormData();
    form.append("name", item.name);
    form.append("categoryId", String(item.categoryId));
    form.append("minimumQuantity", String(item.minimumQuantity));
    form.append("totalQuantity", String(item.totalQuantity));
    form.append("availableQuantity", String(item.availableQuantity));
    form.append("serialNumber", item.serialNumber || "");
    form.append("purchaseSource", item.purchaseSource || "");
    form.append("location", item.location || "");
    form.append("isReturnRequired", String(item.isReturnRequired));
    form.append("managementId", String(item.managementId));
    if (newFile) {
      form.append("image", newFile);
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/items/${id}`, {
        method: "PUT",
        credentials: "include",
        body: form, // multipart/form-data
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      toast.success("성공적으로 수정되었습니다.");
      router.push("/item/manage");
    } catch (err: any) {
      toast.error(`수정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        데이터 로딩 중...
      </div>
    );
  }
  if (!item) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">비품 정보 수정</h1>
          <Link href="/item/manage" className="text-gray-600 hover:underline">
            목록으로
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이미지 */}
          <div className="flex gap-6 items-start">
            <div className="relative w-32 h-32 bg-gray-100 rounded overflow-hidden">
              <Image
                src={preview}
                alt="미리보기"
                fill
                className="object-cover"
              />
            </div>
            <label
              htmlFor="file"
              className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
            >
              이미지 변경
            </label>
            <input
              id="file"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </div>

          {/* 필수 필드 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">상품명</label>
              <input
                name="name"
                value={item.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                name="categoryId"
                value={item.categoryId}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">선택</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">최소수량</label>
              <input
                name="minimumQuantity"
                type="number"
                min={0}
                value={item.minimumQuantity}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">총수량</label>
              <input
                name="totalQuantity"
                type="number"
                min={0}
                value={item.totalQuantity}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                사용가능수량
              </label>
              <input
                name="availableQuantity"
                type="number"
                min={0}
                value={item.availableQuantity}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                name="isReturnRequired"
                type="checkbox"
                checked={item.isReturnRequired}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label className="text-sm">반납 필수 여부</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">구매처</label>
              <input
                name="purchaseSource"
                value={item.purchaseSource || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">보관위치</label>
              <input
                name="location"
                value={item.location || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                시리얼 번호
              </label>
              <input
                name="serialNumber"
                value={item.serialNumber || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {saving ? "저장중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
