// 타입 확장 정의
declare module 'framer-motion';

declare global {
  interface Window {
    particlesJS: (
      elementId: string, 
      options: any
    ) => void;
  }
} 