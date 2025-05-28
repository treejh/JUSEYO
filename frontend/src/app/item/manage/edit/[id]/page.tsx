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
  image?: string; // 기존 이미지 URL
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // string | undefined

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const toast = useCustomToast();

  // 새로 선택한 파일
  const [newFile, setNewFile] = useState<File | null>(null);
  // 이미지 프리뷰 (기존 or 새로 선택한 파일)
  const [preview, setPreview] = useState<string>("");

  // 1) 카테고리 목록 로드
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/categories`, { credentials: "include" })
      .then((res) =>
        res.ok ? res.json() : Promise.reject("카테고리 로드 실패")
      )
      .then((data: Category[]) => setCategories(data))
      .catch(alert);
  }, []);

  // 2) 비품 데이터 로드
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/v1/items/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
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
  }, [id, router]);

  // 3) 새 파일 선택 시 preview 업데이트
  useEffect(() => {
    if (!newFile) return;
    const url = URL.createObjectURL(newFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newFile]);

  // 입력값 변경 처리
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
            : type === "number" || name === "categoryId"
            ? Number(value)
            : value,
      } as Item);
    }
  };

  // 수정 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setSaving(true);

    // FormData에 모든 필드와 파일을 append
    const body = new FormData();
    body.append("name", item.name);
    body.append("categoryId", String(item.categoryId));
    body.append("minimumQuantity", String(item.minimumQuantity));
    body.append("totalQuantity", String(item.totalQuantity));
    body.append("availableQuantity", String(item.availableQuantity));
    body.append("purchaseSource", item.purchaseSource ?? "");
    body.append("location", item.location ?? "");
    body.append("serialNumber", item.serialNumber ?? "");
    body.append("isReturnRequired", String(item.isReturnRequired));
    body.append("managementId", String(item.managementId));
    // status나 createdAt 같은 수정 불필요한 필드는 DTO에서 무시됩니다.

    if (newFile) {
      body.append("image", newFile);
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/items/${id}`, {
        method: "PUT",
        credentials: "include",
        body, // multipart/form-data; boundary=… 자동 설정
      });
      if (!res.ok) throw new Error();
      toast.success("성공적으로 수정되었습니다.");
      router.push("/item/manage");
    } catch {
      toast.error("수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }
  if (!item) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 헤더 영역 */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              비품 정보 수정
            </h1>
            <Link
              href="/item/manage"
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 이미지 업로드 영역 */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                이미지
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {preview ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden shadow-sm">
                      <Image
                        src={preview}
                        alt="미리보기"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center">
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
                      <span className="mt-2 text-sm text-gray-500">
                        이미지 없음
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-gray-400"
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
                    PNG, JPG, GIF (최대 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* 입력 필드 그리드 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 상품명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명
                </label>
                <input
                  name="name"
                  type="text"
                  value={item.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  카테고리
                </label>
                <select
                  name="categoryId"
                  value={item.categoryId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border rounded px-3 py-2"
                >
                  <option value={0}>선택하세요</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* 최소수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  최소수량
                </label>
                <input
                  name="minimumQuantity"
                  type="number"
                  min={0}
                  value={item.minimumQuantity}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              {/* 총수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  총수량
                </label>
                <input
                  name="totalQuantity"
                  type="number"
                  min={0}
                  value={item.totalQuantity}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              {/* 사용가능수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  사용가능수량
                </label>
                <input
                  name="availableQuantity"
                  type="number"
                  min={0}
                  value={item.availableQuantity}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              {/* 반납 필수 */}
              <div className="flex items-center">
                <input
                  name="isReturnRequired"
                  type="checkbox"
                  checked={item.isReturnRequired}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-gray-700">반납 필수 여부</label>
              </div>
              {/* 구매처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  구매처
                </label>
                <input
                  name="purchaseSource"
                  type="text"
                  value={item.purchaseSource || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              {/* 보관위치 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보관위치
                </label>
                <input
                  name="location"
                  type="text"
                  value={item.location || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              {/* 시리얼 번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  시리얼 번호
                </label>
                <input
                  name="serialNumber"
                  type="text"
                  value={item.serialNumber || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow"
              >
                {saving ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    저장 중...
                  </span>
                ) : (
                  "저장"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
