import React from 'react';
import SimpleLayout from '@/components/layouts/SimpleLayout';

export default function TermsPage() {
  return (
    <SimpleLayout title="이용약관">
      <div className="space-y-6 text-gray-600">
        <p className="text-lg">
          본 서비스는 멋쟁이사자처럼 백엔드 부트캠프 13기: Java 프로젝트로 제공되는 무료 서비스입니다.
        </p>

        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>사용자는 본 서비스를 자유롭게 이용할 수 있으며, 서비스 내용은 예고 없이 변경될 수 있습니다.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>서비스 내에서 발생하는 문제에 대해 운영자는 법적 책임을 지지 않습니다.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>사용자는 타인의 권리를 침해하지 않는 범위에서 자유롭게 서비스를 이용해야 합니다.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>비정상적인 접근, 자동화된 공격, 악의적 행위는 금지됩니다.</span>
          </li>
        </ul>
      </div>
    </SimpleLayout>
  );
} 