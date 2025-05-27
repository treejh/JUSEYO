export const fetchUsersByStatus = async (
  status: "approve" | "reject" | "request",
  role: "회원" | "매니저", // 역할 추가
  managementDashboardName: string,
  page: number = 1,
  size: number = 10
) => {
  const endpoints = {
    회원: {
      approve: "/api/v1/users/approve",
      reject: "/api/v1/users/reject",
      request: "/api/v1/users/request",
    },
    매니저: {
      approve: "/api/v1/users/approve/manager",
      reject: "/api/v1/users/reject/manager",
      request: "/api/v1/users/request/manager",
    },
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const url = `${baseUrl}${
    endpoints[role][status]
  }?managementDashboardName=${encodeURIComponent(
    managementDashboardName
  )}&page=${page}&size=${size}`;

  const response = await fetch(url, {
    credentials: "include", // 쿠키 포함
  });

  if (!response.ok) {
    console.error("응답 실패:", response.status);
    throw new Error("데이터를 불러오는 중 오류가 발생했습니다.");
  }

  const data = await response.json();

  // ✨ 여기서 data.data에 바로 접근하도록 수정! ✨
  if (
    !data ||
    !data.data || // data.data는 Page 객체야!
    !data.data.content // Page 객체 안에 content가 있어!
  ) {
    console.error("API 응답 형식이 올바르지 않습니다:", data);
    throw new Error("API 응답 형식이 올바르지 않습니다.");
  }

  // ✨ 반환할 때도 data.data에 바로 접근해서 필요한 정보 가져오기! ✨
  const pageData = data.data; // Page 객체를 따로 변수에 담으면 보기 편해!

  return {
    users: pageData.content, // 유저 리스트는 Page 객체의 content 필드에 있어
    pageable: pageData.pageable, // 페이지 정보
    totalElements: pageData.totalElements, // 전체 요소 수
    totalPages: pageData.totalPages, // 전체 페이지 수
    currentPage: pageData.number + 1, // 현재 페이지 (0부터 시작하므로 +1)
    size: pageData.size, // 페이지 크기
  };
};
