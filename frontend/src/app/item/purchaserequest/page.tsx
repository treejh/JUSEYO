"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FC, useState } from "react";
import { HiX } from "react-icons/hi";

interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
}

interface ItemSearchResponse {
  id: number;
  name: string;
  categoryName: string;
  serialNumber: string;
  minimumQuantity: number;
  totalQuantity: number;
  availableQuantity: number;
  location: string;
}

// 테스트용 비품 데이터
const TEST_ITEMS: Item[] = [
  { id: 1, name: "맥북 프로 16인치", category: "전자기기", price: 3600000 },
  { id: 2, name: "맥북 프로 14인치", category: "전자기기", price: 2900000 },
  { id: 3, name: "모니터 32인치", category: "전자기기", price: 850000 },
  { id: 4, name: "모니터 27인치", category: "전자기기", price: 550000 },
  { id: 5, name: "매직 키보드", category: "전자기기", price: 150000 },
  { id: 6, name: "매직 마우스", category: "전자기기", price: 129000 },
  { id: 7, name: "사무용 의자", category: "가구", price: 450000 },
  { id: 8, name: "전동 높이조절 책상", category: "가구", price: 800000 },
  { id: 9, name: "모니터 받침대", category: "가구", price: 50000 },
  { id: 10, name: "프린터", category: "전자기기", price: 450000 },
  { id: 11, name: "A4용지 (1박스)", category: "사무용품", price: 28000 },
  { id: 12, name: "볼펜 세트", category: "사무용품", price: 15000 },
  { id: 13, name: "포스트잇", category: "사무용품", price: 8000 },
  { id: 14, name: "화이트보드", category: "사무용품", price: 180000 },
  { id: 15, name: "Adobe Creative Cloud", category: "소프트웨어", price: 990000 },
];

const PurchaseRequestPage: FC = () => {
  const [formData, setFormData] = useState({
    category: "",
    itemName: "",
    quantity: "",
    minQuantity: "",
    purchaseFrom: "",
    purchaseDate: "",
    location: "",
    isReturnRequired: "no", // 'yes' or 'no'
    purchaseType: "first", // 'first' or 'repeat'
    image: null as File | null,
    searchQuery: "", // 재구매 시 검색어
  });

  // 검색 결과와 선택된 아이템 상태
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 임시 카테고리 데이터
  const categories = [
    { id: 1, name: "전자기기" },
    { id: 2, name: "사무용품" },
    { id: 3, name: "소프트웨어" },
    { id: 4, name: "가구" },
    { id: 5, name: "도서" },
  ];

  // 검색 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, searchQuery: value }));
    
    if (value.trim()) {
      setIsLoading(true);
      // 테스트 데이터에서 검색
      const filteredResults = TEST_ITEMS.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      // 의도적인 지연
      setTimeout(() => {
        setSearchResults(filteredResults);
        setIsLoading(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  // 아이템 선택 처리
  const handleSelectItem = (item: Item) => {
    setFormData(prev => ({
      ...prev,
      searchQuery: "",
      itemName: item.name
    }));
    setSearchResults([]);
  };

  // 선택된 아이템 제거
  const handleRemoveItem = (itemToRemove: Item) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemToRemove.id));
    
    // 비품 이름 필드에서도 해당 아이템 제거
    const updatedItems = selectedItems.filter(item => item.id !== itemToRemove.id);
    const updatedItemNames = updatedItems.map(item => item.name).join(", ");
    
    setFormData(prev => ({
      ...prev,
      itemName: updatedItemNames
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "purchaseType") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        itemName: value === "repeat" ? "" : prev.itemName, // 재구매 선택 시 비품 이름 초기화
        searchQuery: "" // 검색어 초기화
      }));
      setSearchResults([]); // 검색 결과 초기화
      setSelectedItems([]); // 선택된 아이템 초기화
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 구매 요청 로직 구현
    console.log("구매 요청:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex-1 p-12 pt-8 pl-16 bg-white">
          <div className="mb-6 mt-6">
            <h1 className="text-2xl font-bold text-gray-900">비품 구매서</h1>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="space-y-6">
              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 pr-24 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[center_right_1rem]"
                >
                  <option value="">선택</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 구매 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매 유형
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="first"
                      checked={formData.purchaseType === "first"}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#0047AB] focus:ring-[#0047AB] border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">첫구매</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="repeat"
                      checked={formData.purchaseType === "repeat"}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#0047AB] focus:ring-[#0047AB] border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">재구매</span>
                  </label>
                </div>
              </div>

              {/* 비품 검색 (재구매 시에만 표시) */}
              {formData.purchaseType === "repeat" && (
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비품 검색
                    </label>
                    <input
                      type="text"
                      value={formData.searchQuery}
                      onChange={handleSearch}
                      placeholder="검색할 비품명을 입력하세요"
                      className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                    />
                    {/* 로딩 인디케이터 */}
                    {isLoading && (
                      <div className="absolute right-3 top-[38px]">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0047AB]"></div>
                      </div>
                    )}
                    {/* 검색 결과 드롭다운 */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 비품 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비품 이름
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="비품 이름을 입력해 주세요."
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                  readOnly={formData.purchaseType === "repeat"}
                />
              </div>

              {/* 요청 수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요청 수량
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  placeholder="요청 수량을 입력해 주세요."
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                />
              </div>

              {/* 최소 수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 수량
                </label>
                <input
                  type="number"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="최소 수량을 입력해 주세요."
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                />
              </div>

              {/* 구매 이미지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매 이미지
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="imageInput"
                  />
                  <label
                    htmlFor="imageInput"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    추가하기
                  </label>
                  {formData.image && (
                    <span className="text-sm text-gray-600">
                      {formData.image.name}
                    </span>
                  )}
                </div>
              </div>

              {/* 구매처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매처
                </label>
                <input
                  type="text"
                  name="purchaseFrom"
                  value={formData.purchaseFrom}
                  onChange={handleChange}
                  placeholder="구매처를 입력해 주세요."
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                />
              </div>

              {/* 구매일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매일
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                />
              </div>

              {/* 비치 위치 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  비치 위치
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="비치 위치를 입력해 주세요."
                  className="w-full p-2 border-2 border-gray-200 rounded-md focus:border-[#0047AB] focus:outline-none transition-colors"
                />
              </div>

              {/* 반납 필수 여부 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반납 필수 여부
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isReturnRequired"
                      value="yes"
                      checked={formData.isReturnRequired === "yes"}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#0047AB] focus:ring-[#0047AB] border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">예</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isReturnRequired"
                      value="no"
                      checked={formData.isReturnRequired === "no"}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#0047AB] focus:ring-[#0047AB] border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">아니오</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-12">
              <Button
                type="submit"
                className="bg-[#0047AB] text-white px-4 py-2 rounded text-base hover:bg-[#003380] transition-colors"
              >
                확인
              </Button>
              <Link href="/item">
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-base"
                >
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestPage; 