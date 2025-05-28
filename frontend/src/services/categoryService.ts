// src/services/categoryService.ts

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('API Base URL:', API_BASE_URL); // API URL 로깅

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.url); // 요청 URL 로깅
    console.log('Request Method:', config.method); // 요청 메소드 로깅
    console.log('Request Headers:', config.headers); // 요청 헤더 로깅
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// 에러 응답 타입 정의
interface ErrorResponse {
  status: number;
  code: string;
  message: string;
}

// 비즈니스 에러 타입 정의
export class BusinessError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'BusinessError';
  }
}

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

const categoryService = {
  // 카테고리 생성
  createCategory: async (data: CategoryCreateRequestDTO): Promise<CategoryResponseDTO> => {
    try {
      console.log('Creating category with data:', data);
      const response = await axiosInstance.post<CategoryResponseDTO>('/api/v1/categories', data);
      return response.data;
    } catch (error: any) {
        console.error('Create Category Error:', error);
      
        if (error.response) {
          const rawData = error.response.data;
      
          const errorData: ErrorResponse = typeof rawData === 'string'
            ? { status: error.response.status, code: 'UNKNOWN', message: rawData }
            : rawData;
      
          if (
            error.response.status === 409 ||
            errorData.code === 'CATEGORY_ALREADY_EXISTS'
          ) {
            throw new BusinessError('이미 존재하는 카테고리입니다.', 'CATEGORY_ALREADY_EXISTS');
          }
      
          throw new BusinessError(
            errorData.message || '카테고리 생성에 실패했습니다.',
            errorData.code || 'UNKNOWN_ERROR'
          );
        }
      
        throw new BusinessError('카테고리 생성에 실패했습니다.', 'NETWORK_ERROR');
      }
  },

  // 전체 카테고리 조회
  getAllCategories: async (): Promise<CategoryResponseDTO[]> => {
    try {
      console.log('Fetching categories...'); // 디버깅용 로그
      const response = await axiosInstance.get<CategoryResponseDTO[]>('/api/v1/categories');
      console.log('Categories response:', response.data); // 디버깅용 로그
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error); // 디버깅용 로그
      throw error;
    }
  },

  // 특정 카테고리 조회
  getCategoryById: async (id: number): Promise<CategoryResponseDTO> => {
    try {
      const response = await axiosInstance.get<CategoryResponseDTO>(`/api/v1/categories/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          throw new Error(axiosError.response.data.message || '카테고리 조회에 실패했습니다.');
        }
      }
      throw new Error('카테고리 조회에 실패했습니다.');
    }
  },

  // 카테고리 수정
  updateCategory: async (id: number, data: CategoryUpdateRequestDTO): Promise<CategoryResponseDTO> => {
    try {
      const response = await axiosInstance.put<CategoryResponseDTO>(`/api/v1/categories/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          const errorData = axiosError.response.data as ErrorResponse;
          if (errorData.code === 'CATEGORY_ALREADY_EXISTS') {
            throw new Error('이미 존재하는 카테고리입니다.');
          }
          throw new Error(errorData.message || '카테고리 수정에 실패했습니다.');
        }
      }
      throw new Error('카테고리 수정에 실패했습니다.');
    }
  },

  // 카테고리 삭제
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/v1/categories/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data) {
          throw new Error(axiosError.response.data.message || '카테고리 삭제에 실패했습니다.');
        }
      }
      throw new Error('카테고리 삭제에 실패했습니다.');
    }
  },
};

export default categoryService; 