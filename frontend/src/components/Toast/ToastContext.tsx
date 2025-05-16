"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Toast, ToastType, ToastPosition } from "./Toast";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
  isDark?: boolean;
};

type ToastContextType = {
  toasts: ToastItem[];
  showToast: (
    message: string, 
    type?: ToastType, 
    duration?: number,
    position?: ToastPosition,
    isDark?: boolean
  ) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  // 다크모드 감지
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행되도록 함
    setPortalElement(document.getElementById("toast-portal") || document.body);
    
    // 시스템 다크모드 감지
    if (typeof window !== 'undefined') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setPrefersDarkMode(darkModeMediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersDarkMode(e.matches);
      };
      
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string, 
      type: ToastType = "info", 
      duration: number = 3000,
      position?: ToastPosition,
      isDark?: boolean
    ) => {
      const id = uuidv4();
      setToasts((prevToasts) => [
        ...prevToasts, 
        { 
          id, 
          message, 
          type, 
          duration, 
          position, 
          isDark: isDark ?? prefersDarkMode 
        }
      ]);
    },
    [prefersDarkMode]
  );

  // 위치별로 토스트 그룹화
  const groupedToasts = toasts.reduce<Record<ToastPosition, ToastItem[]>>(
    (acc, toast) => {
      const position = toast.position || 'top-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, ToastItem[]>
  );

  // 위치별 스타일
  const getPositionStyle = (position: ToastPosition): string => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4 items-end';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-right':
        return 'bottom-4 right-4 items-end';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
      default:
        return 'top-4 right-4 items-end';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {portalElement &&
        Object.entries(groupedToasts).map(([position, positionToasts]) => 
          createPortal(
            <div 
              key={position}
              className={`fixed z-50 flex flex-col ${getPositionStyle(position as ToastPosition)}`}
            >
              {positionToasts.map((toast) => (
                <Toast
                  key={toast.id}
                  id={toast.id}
                  message={toast.message}
                  type={toast.type}
                  duration={toast.duration}
                  isDark={toast.isDark}
                  onClose={() => removeToast(toast.id)}
                />
              ))}
            </div>,
            portalElement
          )
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}; 