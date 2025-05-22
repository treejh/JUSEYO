"use client";

import React, { useEffect, useState } from "react"; // use 제거
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Item {
  id: number;
  name: string;
  categoryName: string;
  totalQuantity: number;
  availableQuantity: number;
  purchaseSource?: string;
  location?: string;
  serialNumber?: string;
  status: string;
  image?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function EditItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const params = useParams();
  const id = params?.id; // string | undefined

  // 데이터 불러오기
  useEffect(() => {
    if (!id) return;
    const fetchItem = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/items/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
        const data = await res.json();
        setItem(data);
        if (data.image) setImagePreview(data.image);
      } catch (err) {
        alert("데이터 로딩 중 오류가 발생했습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(item),
      });

      if (!res.ok) throw new Error("수정에 실패했습니다.");

      alert("성공적으로 수정되었습니다.");
      router.push("/item/manage");
    } catch (err) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">비품 정보 수정</h1>
            <Link
              href="/item/manage"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              ← 목록으로
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이미지 프리뷰 */}
            <div className="flex justify-center">
              {imagePreview ? (
                <div className="relative w-40 h-40">
                  <Image
                    src={imagePreview}
                    alt="상품 이미지"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">이미지 없음</span>
                </div>
              )}
            </div>

            {/* 폼 필드들 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  상품명
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  카테고리
                </label>
                <input
                  type="text"
                  value={item.categoryName}
                  onChange={(e) =>
                    setItem({ ...item, categoryName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  총 수량
                </label>
                <input
                  type="number"
                  value={item.totalQuantity}
                  onChange={(e) =>
                    setItem({ ...item, totalQuantity: Number(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  사용 가능 수량
                </label>
                <input
                  type="number"
                  value={item.availableQuantity}
                  onChange={(e) =>
                    setItem({
                      ...item,
                      availableQuantity: Number(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  구매처
                </label>
                <input
                  type="text"
                  value={item.purchaseSource || ""}
                  onChange={(e) =>
                    setItem({ ...item, purchaseSource: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  보관 위치
                </label>
                <input
                  type="text"
                  value={item.location || ""}
                  onChange={(e) =>
                    setItem({ ...item, location: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  시리얼 번호
                </label>
                <input
                  type="text"
                  value={item.serialNumber || ""}
                  onChange={(e) =>
                    setItem({ ...item, serialNumber: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
