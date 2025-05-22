export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-sm py-6 border-t w-full">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>© 2025 JUSEYO. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/terms" className="hover:underline">이용약관</a>
          <a href="/privacy" className="hover:underline">개인정보 처리방침</a>
          <a href="/support" className="hover:underline">고객지원</a>
        </div>
      </div>
    </footer>
  );
} 