const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// 이름 수정 API
export const updateUserName = async (name: string) => {
  const response = await fetch(`${API_BASE}/api/v1/users/name`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("이름을 수정할 수 없습니다.");
  }

  return response.json();
};

// 이메일 수정 API
export const updateUserEmail = async (email: string) => {
  const response = await fetch(`${API_BASE}/api/v1/users/email`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("이메일을 수정할 수 없습니다.");
  }

  return response.json();
};

// 핸드폰 번호 수정 API
export const updateUserPhoneNumber = async (phoneNumber: string) => {
  const response = await fetch(`${API_BASE}/api/v1/users/phoneNumber`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ phoneNumber }),
  });

  if (!response.ok) {
    throw new Error("핸드폰 번호를 수정할 수 없습니다.");
  }

  return response.json();
};

// 비밀번호 변경 API
export const updateUserPassword = async (
  beforePassword: string,
  changePassword: string
) => {
  const response = await fetch(`${API_BASE}/api/v1/users/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ beforePassword, changePassword }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("이전 비밀번호가 틀립니다.");
    }
    throw new Error("비밀번호를 변경할 수 없습니다.");
  }

  return response.json();
};
