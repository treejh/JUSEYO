export const checkEmailDuplication = async (
  email: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/duplication/email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      throw new Error("서버 응답이 실패했습니다.");
    }

    const responseData = await response.json();

    // ResponseEntity 구조에서 data 필드 추출
    const isDuplicate = responseData.data;
    // isDuplicate가 true이면 이메일이 중복됨

    console.log("이메일 중복 확인 결과:", isDuplicate);

    if (isDuplicate) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("이메일 중복 확인 실패:", error);
    return false;
  }
};

export const sendAuthCode = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/emails/certificationNumber`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("인증번호 발송 실패:", error);
    return false;
  }
};

export const verifyAuthCode = async (
  email: string,
  authCode: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/emails/verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, authCode }),
      }
    );

    if (!response.ok) {
      throw new Error("서버 응답이 실패했습니다.");
    }

    const responseData = await response.json();
    console.log("인증번호 확인 결과:", responseData);

    // ResponseEntity 구조에서 status 필드 확인
    if (responseData.statusCode === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("인증번호 확인 실패 - 인증번호 올바르지 않은거임:", error);
    return false;
  }
};
