// src/components/LoadingScreen.tsx

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "로딩 중입니다..." }: LoadingScreenProps) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen w-screen bg-white text-black">
      <img
        src="/spinner.gif"
        alt="로딩 중"
        className="w-16 h-16"
      />
      <div className="text-sm text-gray-600">{message}</div>
    </div>
  );
}
