"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL || "";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface Item {
  id: number;
  name: string;
  categoryName: string;
  image: string | null;
  status: string;
  totalQuantity: number;
  availableQuantity: number;
}

interface Category {
  id: number;
  name: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const ITEMS_PER_PAGE = 15;

export default function ItemViewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "미분류";
  };

  // ✅ 카테고리 전체 불러오기
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get<Category[]>("/api/v1/categories");
      setCategories([{ id: 0, name: "전체" }, ...response.data]);
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
      toast.error("카테고리를 불러오는데 실패했습니다.");
    }
  };

  // ✅ 전체 비품 조회
  const fetchAllItems = async (page: number = 0) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<PageResponse<Item>>(
        `/api/v1/items?page=${page}&size=${ITEMS_PER_PAGE}&sort=createdAt,desc`
      );
      const data = response.data;
      setItems(data.content);
      setFilteredItems(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(data.number);
    } catch (error) {
      console.error("전체 비품 조회 실패:", error);
      toast.error("비품을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 카테고리별 비품 조회
  const fetchItemsByCategory = async (categoryId: number, page: number = 0) => {
    if (categoryId === 0) return fetchAllItems(page); // 전체 탭이면 전체 다시 불러오기

    try {
      setIsLoading(true);
      const response = await axiosInstance.get<PageResponse<Item>>(
        `/api/v1/items/by-category?categoryId=${categoryId}&page=${page}&size=${ITEMS_PER_PAGE}&sort=createdAt,desc`
      );

      console.log("카테고리별 응답:", response.data);

      const data = response.data;
      setItems(data.content);
      setFilteredItems(data.content);
      setTotalPages(data.totalPages);
      setCurrentPage(data.number);
    } catch (error) {
      console.error("카테고리별 비품 조회 실패:", error);
      toast.error("카테고리별 비품을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllItems();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(lower)
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  useEffect(() => {
    fetchItemsByCategory(selectedCategory, 0);
  }, [selectedCategory]);

  const handlePageChange = (page: number) => {
    fetchItemsByCategory(selectedCategory, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRequest = (item: Item) => {
    console.log("요청된 아이템:", item);
    toast.info("요청 기능은 아직 준비 중입니다.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">비품 조회</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="비품을 검색해 주세요."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">

          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-4 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-md">
                {item.image ? (
                  <Image
                    src={item.image.startsWith("http") ? item.image : `/${item.image}`}
                    alt={item.name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-md"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {item.name}
                </h3>
                <span className="text-sm text-gray-500 mb-4">{item.categoryName}</span>
                <div className="mt-auto">
                  <button
                    onClick={() => handleRequest(item)}
                    className="self-start px-4 py-1.5 text-sm bg-white border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    요청
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-md bg-white text-gray-600 border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 rounded-md bg-white text-gray-600 border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
