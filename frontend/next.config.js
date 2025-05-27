// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 빌드 중 ESLint 오류 무시
  },
  images: {
    domains: [
      "example-bucket.s3.ap-northeast-2.amazonaws.com",
      "juseyo.s3.ap-northeast-2.amazonaws.com",
      // 추가 버킷 도메인
    ],
  },
};

module.exports = nextConfig;
