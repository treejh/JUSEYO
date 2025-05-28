import React from 'react';
import SimpleLayout from '@/components/layouts/SimpleLayout';

export default function SupportPage() {
  return (
    <SimpleLayout title="고객지원">
      <div className="space-y-10 text-gray-600">
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            문의사항이 있으신가요?
          </h2>
          
          <div className="space-y-3">
            <a
              href="mailto:juseyo0512@gmail.com"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-900">juseyo0512@gmail.com</span>
            </a>

            <a
              href="https://github.com/treejh/JUSEYO/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span className="text-gray-900">GitHub 이슈 등록하기</span>
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            자주 묻는 질문
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Q. 서비스가 갑자기 안돼요
              </h3>
              <p>
                A. 가끔 서버가 잠시 중단될 수 있어요. 잠시 후 다시 시도해주세요.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Q. 피드백은 어떻게 보내요?
              </h3>
              <p>
                A. 이메일이나 GitHub 이슈로 남겨주시면 확인합니다!
              </p>
            </div>
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
} 