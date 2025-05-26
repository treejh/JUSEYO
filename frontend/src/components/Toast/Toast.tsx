"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPosition = "top-right" | "top-center" | "bottom-right" | "bottom-center";

export type ToastProps = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  isDark?: boolean;
};

export function Toast({
  id,
  message,
  type = "info",
  duration = 3000,
  onClose,
  isDark = false,
}: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300); // 애니메이션 지속 시간
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBgColor = () => {
    if (isDark) {
      switch (type) {
        case "success":
          return "bg-green-700";
        case "error":
          return "bg-red-700";
        case "warning":
          return "bg-yellow-700";
        case "info":
        default:
          return "bg-blue-700";
      }
    } else {
      switch (type) {
        case "success":
          return "bg-green-500";
        case "error":
          return "bg-red-500";
        case "warning":
          return "bg-yellow-500";
        case "info":
        default:
          return "bg-blue-500";
      }
    }
  };

  const getTextColor = () => {
    return isDark ? "text-gray-100" : "text-white";
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`flex items-center w-full max-w-xs p-4 mb-4 ${getTextColor()} rounded-lg shadow-lg ${getBgColor()} transition-all duration-300 ${
        isClosing ? "opacity-0 translate-x-full" : "opacity-100"
      } ${isDark ? 'border border-gray-700' : ''}`}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${isDark ? 'bg-gray-600/50' : 'bg-white/25'} ${getTextColor()}`}>
        {getIcon()}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 ${getTextColor()} hover:text-gray-200 focus:outline-none`}
        onClick={() => {
          setIsClosing(true);
          setTimeout(onClose, 300);
        }}
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
} 