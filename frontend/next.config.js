// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 여기에 본인이 실제 쓰는 S3 버킷 호스트명을 모두 나열하세요.
    domains: [
      "example-bucket.s3.ap-northeast-2.amazonaws.com",
      "juseyo.s3.ap-northeast-2.amazonaws.com",
      // ...(추가 버킷이 있으면 계속)
    ],
    eslint: {
      // 빌드 중에 ESLint 검사를 건너뜁니다
      ignoreDuringBuilds: true,
    },

    typescript: {
      // 빌드 시 타입 체크를 실행하지 않음
      ignoreBuildErrors: true,
    },
  },
};

module.exports = nextConfig;
