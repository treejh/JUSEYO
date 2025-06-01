"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import Link from "next/link";
import Image from "next/image";

// API 반환 DTO
interface ItemInstance {
  id: number;
  itemName: string;
  instanceCode: string;
  outbound: string;
  status: string;
  borrowerName?: string;
  returnDate?: string; // 반납일 필드
  createdAt: string;
  finalImage?: string;
  itemImage?: string;
}

interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export default function ItemInstanceManagePage() {
  const router = useRouter();
  const { isLogin } = useGlobalLoginUser();

  const [instances, setInstances] = useState<ItemInstance[]>([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 로그인 체크
  useEffect(() => {
    if (!isLogin) router.push("/login");
  }, [isLogin, router]);
  if (!isLogin) return null;

  // 서버에서 페이지 단위로 불러온 뒤, 최신순 정렬
  const loadInstances = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        keyword: search.trim(),
      });
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/v1/item-instances?${params.toString()}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: Page<any> = await res.json();

      const mapped: ItemInstance[] = data.content
        .map((r: any) => ({
          id: r.id,
          itemName: r.itemName,
          instanceCode: r.instanceCode,
          outbound: r.outbound,
          status: r.status,
          borrowerName: r.borrowerName ?? r.borrower_name,
          returnDate:
            r.returnDate ??
            r.return_date ??
            r.supplyRequest?.returnDate ??
            r.supply_request?.return_date,
          createdAt: r.createdAt,
          finalImage: r.finalImage,
          itemImage: r.itemImage,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setInstances(mapped);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
      setError("자산 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    if (isLogin) loadInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleSearch = () => {
    setPage(0);
    loadInstances();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* 헤더 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                비품 관리
              </h1>
              <div className="flex gap-4 mb-4 border-b border-gray-200">
                <Link
                  href="/item/manage"
                  className="px-4 py-3 font-medium text-gray-600 hover:text-[#0047AB] border-b-2 border-transparent hover:border-[#0047AB] transition-all"
                >
                  비품 정보
                </Link>
                <Link
                  href="/item/iteminstance/manage"
                  className="px-4 py-3 font-medium text-[#0047AB] border-b-2 border-[#0047AB]"
                >
                  재고 단위
                </Link>
              </div>
              <p className="text-gray-600">
                비품의 개별 자산 현황을 확인할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 검색 섹션 */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="코드 또는 품목명으로 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">자산 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "NO", // "ID"에서 "NO"로 변경
                      "품목명",
                      "인스턴스 코드",
                      "출고 유형",
                      "대여자",
                      "반납일",
                      "생성일",
                      "이미지",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instances.map((inst, index) => (
                    <tr
                      key={inst.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page * size + index + 1}{" "}
                        {/* inst.id 대신 순차적인 번호로 변경 */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inst.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inst.instanceCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {inst.outbound}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inst.borrowerName || "–"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inst.returnDate
                          ? new Date(inst.returnDate).toLocaleDateString(
                              "ko-KR"
                            )
                          : "–"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inst.createdAt).toLocaleString("ko-KR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inst.finalImage || inst.itemImage ? (
                          <button
                            onClick={() =>
                              setSelectedImage(
                                inst.finalImage || inst.itemImage || ""
                              )
                            }
                            className="text-[#0047AB] hover:text-[#003380] transition-colors duration-200"
                          >
                            <svg
                              className="w-5 h-5"
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
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    처음
                  </button>
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    이전
                  </button>
                  <span className="text-gray-600">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    다음
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    마지막
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 이미지 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              onClick={() => setSelectedImage(null)}
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
            <div className="flex justify-center">
              <Image
                src={selectedImage}
                alt="비품 이미지"
                width={800}
                height={800}
                className="max-h-[80vh] w-auto object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                  target.classList.add("opacity-50");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
