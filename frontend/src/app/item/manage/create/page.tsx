"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

export default function CreateItemPage() {
  const router = useRouter();
  const toast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameExists, setNameExists] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    purchaseSource: "",
    location: "",
    image: null as File | null,
    minimumQuantity: 0,
    totalQuantity: 0,
    isReturnRequired: false,
    inbound: "PURCHASE" as "PURCHASE"
  });

  // 카테고리 목록 불러오기
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/categories`,
          {
            credentials: "include",
          }
        );
        if (!res.ok)
          throw new Error("카테고리 목록을 불러오는데 실패했습니다.");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        toast.error("카테고리 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchCategories();
  }, []);

  // 이름 중복 확인
  const checkName = async () => {
    if (!formData.name.trim()) return;
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/v1/items/exists?name=${encodeURIComponent(formData.name)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("중복 체크 실패");
      const { exists } = (await res.json()) as { exists: boolean };
      setNameExists(exists);
      if (exists) {
        toast.error("이미 등록된 이름입니다. 다른 이름을 입력하세요.");
      }
    } catch (err) {
      toast.error("이름 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 항목 검증
    if (!formData.name || !formData.categoryId) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }

    // 이름 중복 검증
    if (nameExists) {
      toast.error("이미 등록된 이름입니다. 다른 이름을 입력하세요.");
      return;
    }

    // 수량 로직 검증
    if (formData.totalQuantity < formData.minimumQuantity) {
      toast.error("총수량은 최소수량 이상이어야 합니다.");
      return;
    }
    if (formData.totalQuantity < 0) {
      toast.error("총수량은 0 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("itemName", formData.name);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("minimumQuantity", formData.minimumQuantity.toString());
      formDataToSend.append("quantity", formData.totalQuantity.toString());
      formDataToSend.append("purchaseSource", formData.purchaseSource || "");
      formDataToSend.append("location", formData.location || "");
      formDataToSend.append("isReturnRequired", formData.isReturnRequired.toString());
      formDataToSend.append("inbound", formData.inbound);
      if (formData.image) formDataToSend.append("image", formData.image);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/register-items`,
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        }
      );

      if (!res.ok) throw new Error("비품 등록에 실패했습니다.");

      toast.success("비품이 성공적으로 등록되었습니다.");
      router.push("/item/manage");
    } catch (error) {
      toast.error("비품 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                비품 추가
              </h1>
              <p className="text-gray-600">새로운 비품을 등록할 수 있습니다.</p>
            </div>
          </div>

          {/* 폼 섹션 */}
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽 컬럼 - 기본 정보 */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    비품명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={checkName}
                    placeholder="비품명을 입력하세요"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent ${
                      nameExists ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {nameExists && (
                    <p className="mt-1 text-sm text-red-600">
                      동일한 이름의 비품이 이미 존재합니다.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white"
                    required
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      최소수량 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="minimumQuantity"
                      value={formData.minimumQuantity}
                      onChange={handleInputChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      총수량 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalQuantity"
                      value={formData.totalQuantity}
                      onChange={handleInputChange}
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    구매처
                  </label>
                  <input
                    type="text"
                    name="purchaseSource"
                    value={formData.purchaseSource}
                    onChange={handleInputChange}
                    placeholder="구매처를 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    보관 위치
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="보관 위치를 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isReturnRequired"
                    name="isReturnRequired"
                    checked={formData.isReturnRequired}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-[#0047AB] focus:ring-[#0047AB] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isReturnRequired"
                    className="text-sm font-medium text-gray-700"
                  >
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
                    {imagePreview ? (
                      <div className="relative w-full aspect-square mb-4">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="rounded-lg object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData((prev) => ({ ...prev, image: null }));
                          }}
                          className="absolute -top-2 -right-2 bg-black/50 hover:bg-black/70 p-2 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all duration-200 shadow-lg"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
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
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="mt-1">또는 드래그 앤 드롭</p>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF up to 10MB
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
              <Link
                href="/item/manage"
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB]"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#0047AB] rounded-lg hover:bg-[#003380] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    처리 중...
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
