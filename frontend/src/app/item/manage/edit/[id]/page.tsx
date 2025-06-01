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
      <div className="bg-white p-8 text-center rounded-lg shadow-sm min-h-screen flex items-center justify-center">
        <div>
          <div className="animate-spin h-12 w-12 border-b-2 border-[#0047AB] rounded-full mx-auto" />
          <p className="mt-4 text-gray-500">비품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  if (!item) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">비품 정보 수정</h1>
              <p className="text-gray-600">비품의 상세 정보를 수정할 수 있습니다.</p>
            </div>
          </div>

          {/* 폼 섹션 */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽 컬럼 - 기본 정보 */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    상품명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={item.name}
                    onChange={handleChange}
                    required
                    placeholder="상품명을 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={item.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      최소수량
                    </label>
                    <input
                      name="minimumQuantity"
                      type="number"
                      min={0}
                      value={item.minimumQuantity}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      총수량 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="totalQuantity"
                      type="number"
                      min={0}
                      value={item.totalQuantity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      사용가능수량 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="availableQuantity"
                      type="number"
                      min={0}
                      value={item.availableQuantity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    구매처
                  </label>
                  <input
                    name="purchaseSource"
                    value={item.purchaseSource || ""}
                    onChange={handleChange}
                    placeholder="구매처를 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    보관 위치
                  </label>
                  <input
                    name="location"
                    value={item.location || ""}
                    onChange={handleChange}
                    placeholder="보관 위치를 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isReturnRequired"
                    name="isReturnRequired"
                    checked={item.isReturnRequired}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#0047AB] focus:ring-[#0047AB] border-gray-300 rounded"
                  />
                  <label htmlFor="isReturnRequired" className="text-sm font-medium text-gray-700">
                    반납 필수 여부
                  </label>
                </div>
              </div>
              {/* 오른쪽 컬럼 - 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  비품 이미지
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 h-full">
                  <div className="space-y-1 text-center w-full">
                    {preview ? (
                      <div className="relative w-full aspect-square mb-4">
                        <Image
                          src={preview}
                          alt="미리보기"
                          fill
                          className="rounded-lg object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreview("");
                            setNewFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-black/50 hover:bg-black/70 p-2 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0047AB] transition-all bg-gray-50">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex flex-col items-center mt-4 text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer rounded-md font-medium text-[#0047AB] hover:text-[#003380] focus-within:outline-none"
                          >
                            <span>이미지 업로드</span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              accept="image/*"
                              onChange={handleChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="mt-1">또는 드래그 앤 드롭</p>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF 최대 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* 버튼 섹션 */}
            <div className="flex justify-end space-x-3 pt-8 mt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#0047AB] rounded-lg hover:bg-[#003380] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    저장중...
                  </div>
                ) : (
                  "저장"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
