"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";

interface Item {
  id: number;
  name: string;
  categoryName: string;
  minimumQuantity: number;
  purchaseSource?: string;
  location?: string;
  image?: string;
  categoryId?: number;
  isReturnRequired: boolean;
}

export default function PurchaseItemPage() {
  const router = useRouter();
  const toast = useCustomToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 0,
    itemName: "",
    minimumQuantity: 0,
    purchaseSource: "",
    location: "",
    isReturnRequired: false,
    image: null as File | null,
    categoryId: "",
    inbound: "RE_PURCHASE" as "RE_PURCHASE",
    isImageModified: false
  });

  // 기존 비품 목록 불러오기
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/items/all`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("비품 목록을 불러오는데 실패했습니다.");
        const data = await res.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        toast.error("비품 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchItems();
  }, []);

  // 검색어에 따른 필터링
  useEffect(() => {
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file, isImageModified: true }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemSelect = async (item: Item) => {
    setSelectedItem(item);
    setFormData(prev => ({
      ...prev,
      itemId: item.id.toString(),
      itemName: item.name,
      minimumQuantity: item.minimumQuantity,
      purchaseSource: item.purchaseSource || "",
      location: item.location || "",
      categoryId: item.categoryId?.toString() || "",
      isReturnRequired: item.isReturnRequired,
      image: null,
      isImageModified: false
    }));
    setSearchTerm("");
    
    // 기존 이미지가 있다면 미리보기로 표시
    if (item.image) {
      const imageUrl = item.image.startsWith('http') 
        ? item.image 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemId || formData.quantity <= 0 || !formData.purchaseSource || !formData.location) {
      toast.error("필수 항목을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("quantity", formData.quantity.toString());
      formDataToSend.append("itemName", formData.itemName);
      formDataToSend.append("minimumQuantity", formData.minimumQuantity.toString());
      formDataToSend.append("purchaseSource", formData.purchaseSource);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("isReturnRequired", formData.isReturnRequired.toString());
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("inbound", formData.inbound);
      // 이미지가 수정된 경우에만 이미지 파일 전송
      if (formData.isImageModified && formData.image) {
        formDataToSend.append("image", formData.image);
      }

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
                기존 비품 추가
              </h1>
              <p className="text-gray-600">기존 비품의 수량을 추가할 수 있습니다.</p>
            </div>
          </div>

          {/* 폼 섹션 */}
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 왼쪽 컬럼 - 기본 정보 */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    비품 선택 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="비품 이름으로 검색"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    />
                    {searchTerm && filteredItems.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.categoryName}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedItem && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{selectedItem.name}</div>
                      <div className="text-sm text-gray-500">{selectedItem.categoryName}</div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    수량 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min={1}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    구매처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="purchaseSource"
                    value={formData.purchaseSource}
                    onChange={handleInputChange}
                    placeholder="구매처를 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    보관 위치 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="보관 위치를 입력하세요"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* 오른쪽 컬럼 - 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  구매 이미지
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