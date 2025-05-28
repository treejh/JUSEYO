// src/services/categoryService.ts

import axiosInstance from './axiosInstance';

// ✅ DTO 정의
export interface CategoryCreateRequestDTO {
  name: string;
}

export interface CategoryUpdateRequestDTO {
  name: string;
}

export interface CategoryResponseDTO {
  id: number;
  name: string;
  itemCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  status: number;
  code: string;
  message: string;
}

// ✅ 커스텀 에러 클래스
export class BusinessError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'BusinessError';
  }
}

// ✅ 공통 에러 핸들러
function handleError(error: any, fallbackMessage: string): never {
  if (error.response?.data) {
    const data = error.response.data as ErrorResponse;
    if (data.code === 'CATEGORY_ALREADY_EXISTS') {
      throw new BusinessError('이미 존재하는 카테고리입니다.', data.code);
    }
    throw new BusinessError(data.message || fallbackMessage, data.code || 'UNKNOWN_ERROR');
  }
  throw new BusinessError(fallbackMessage, 'NETWORK_ERROR');
}

// ✅ 카테고리 서비스
const categoryService = {
  // 카테고리 생성
  createCategory: async (data: CategoryCreateRequestDTO): Promise<CategoryResponseDTO> => {
    try {
      const { data: resData } = await axiosInstance.post<CategoryResponseDTO>('/api/v1/categories', data);
      return resData;
    } catch (error) {
      handleError(error, '카테고리 생성 실패');
      throw error;
    }
  },

  // 전체 카테고리 조회
  getAllCategories: async (): Promise<CategoryResponseDTO[]> => {
    try {
      const { data } = await axiosInstance.get<CategoryResponseDTO[]>('/api/v1/categories');
      return data;
    } catch (error) {
      handleError(error, '카테고리 목록 불러오기 실패');
      throw error;
    }
  },

  // 단일 카테고리 조회
  getCategoryById: async (id: number): Promise<CategoryResponseDTO> => {
    try {
      const { data } = await axiosInstance.get<CategoryResponseDTO>(`/api/v1/categories/${id}`);
      return data;
    } catch (error) {
      handleError(error, '카테고리 조회 실패');
      throw error;
    }
  },

  // 카테고리 수정
  updateCategory: async (id: number, data: CategoryUpdateRequestDTO): Promise<CategoryResponseDTO> => {
    try {
      const { data: resData } = await axiosInstance.put<CategoryResponseDTO>(`/api/v1/categories/${id}`, data);
      return resData;
    } catch (error) {
      handleError(error, '카테고리 수정 실패');
      throw error;
    }
  },

  // 카테고리 삭제
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/v1/categories/${id}`);
    } catch (error) {
      handleError(error, '카테고리 삭제 실패');
      throw error;
    }
  }
};

export default categoryService;
