"use client";

import { useToast } from "@/components/Toast/ToastContext";
import { ToastPosition, ToastType } from "@/components/Toast/Toast"; 

export function useCustomToast() {
  const { showToast } = useToast();
  
  return {
    success: (message: string, options?: { duration?: number, position?: ToastPosition, isDark?: boolean }) => {
      showToast(
        message, 
        "success", 
        options?.duration, 
        options?.position || "top-right", 
        options?.isDark
      );
    },
    error: (message: string, options?: { duration?: number, position?: ToastPosition, isDark?: boolean }) => {
      showToast(
        message, 
        "error", 
        options?.duration, 
        options?.position || "top-center", 
        options?.isDark
      );
    },
    warning: (message: string, options?: { duration?: number, position?: ToastPosition, isDark?: boolean }) => {
      showToast(
        message, 
        "warning", 
        options?.duration, 
        options?.position || "top-center", 
        options?.isDark
      );
    },
    info: (message: string, options?: { duration?: number, position?: ToastPosition, isDark?: boolean }) => {
      showToast(
        message, 
        "info", 
        options?.duration, 
        options?.position || "top-right", 
        options?.isDark
      );
    },
    // 맞춤형 상황별 메소드
    notify: {
      // 일반적인 성공/실패
      general: (message: string, type: ToastType, options?: { duration?: number, isDark?: boolean }) => {
        showToast(
          message, 
          type, 
          options?.duration, 
          "top-right", 
          options?.isDark
        );
      },
      // 모바일 웹용
      mobile: (message: string, type: ToastType, options?: { duration?: number, isDark?: boolean }) => {
        showToast(
          message, 
          type, 
          options?.duration, 
          "bottom-center", 
          options?.isDark
        );
      },
      // 중요한 오류
      important: (message: string, options?: { duration?: number, isDark?: boolean }) => {
        showToast(
          message, 
          "error", 
          options?.duration || 5000, // 더 오래 보여줌
          "top-center", 
          options?.isDark
        );
      },
      // 비방해성 정보
      subtle: (message: string, options?: { duration?: number, isDark?: boolean }) => {
        showToast(
          message, 
          "info", 
          options?.duration || 2000, // 더 짧게 보여줌
          "bottom-right", 
          options?.isDark || true // 기본적으로 다크모드
        );
      }
    }
  };
} 