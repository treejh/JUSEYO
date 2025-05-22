"use client";

import React, { useEffect, useState } from 'react';
import styles from './inventory-table.module.css';

interface Item {
  name: string;
  categoryName: string;
  minimumQuantity: number;
  totalQuantity: number;
}

interface PageResponse {
  content: Item[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export default function InventoryTable() {
  const [items, setItems] = useState<PageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchItems = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!API_URL) throw new Error('API URL이 설정되지 않았습니다.');

      const response = await fetch(
        `${API_URL}/api/v1/items?page=${currentPage}&size=5&sort=${sortOrder}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      console.error('비품 목록 로딩 에러:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, sortOrder]);

  const getStatusColor = (current: number, minimum: number): string => {
    const ratio = current / minimum;
    if (ratio >= 2) return 'bg-emerald-500';
    if (ratio >= 1) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusText = (current: number, minimum: number): string => {
    const ratio = current / minimum;
    if (ratio >= 2) return '충분';
    if (ratio >= 1) return '적정';
    return '부족';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-white rounded-lg shadow">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchItems}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">비품 수량 현황</h2>
        <div className="flex items-center gap-4">

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm">{sortOrder === 'asc' ? '오름차순' : '내림차순'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                품목명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                재고 수량
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                최소 수량
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items?.content.map((item) => (
              <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.categoryName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.totalQuantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.minimumQuantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-[100px]">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatusColor(item.totalQuantity, item.minimumQuantity)}`}
                          style={{
                            width: `${Math.min((item.totalQuantity / item.minimumQuantity) * 50, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      getStatusColor(item.totalQuantity, item.minimumQuantity).replace('bg-', 'text-')
                    }`}>
                      {getStatusText(item.totalQuantity, item.minimumQuantity)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>총 {items?.totalElements}개 중 </span>
          <span className="font-medium mx-1">
            {items ? items.number * items.size + 1 : 0}-
            {items ? Math.min((items.number + 1) * items.size, items.totalElements) : 0}
          </span>
          <span>개 표시</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={!items || items.first}
            className="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!items || items.last}
            className="px-3 py-1 text-sm border rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
} 