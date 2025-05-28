import React from 'react';
import SimpleLayout from '@/components/layouts/SimpleLayout';

export default function PrivacyPage() {
  return (
    <SimpleLayout title="개인정보 처리방침">
      <div className="space-y-8 text-gray-600">
        <p className="text-lg">
          서비스는 최소한의 개인정보만 수집하며, 수집한 정보는 다음과 같이 사용됩니다:
        </p>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">수집 항목</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>이메일 주소</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>전화번호</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">이용 목적</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>문의 응답</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>기능 개선 참고용</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">보관 기간</h2>
            <p>사용자의 요청 시 즉시 삭제</p>
          </section>

          <p className="text-gray-700">
            본 정보는 제3자에게 제공되지 않으며, 보안을 위해 노력하고 있습니다.
          </p>

          <div className="pt-4 border-t">
            <p>
              언제든지 개인정보 삭제를 요청하실 수 있습니다:{' '}
              <a 
                href="mailto:juseyo0512@gmail.com" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                juseyo0512@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
} 