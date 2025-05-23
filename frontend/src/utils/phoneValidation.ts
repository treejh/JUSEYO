export const checkPhoneDuplication = async (
  phoneNumber: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/duplication/phone`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      }
    );

    if (!response.ok) {
      throw new Error("서버 응답이 실패했습니다.");
    }

    const responseData = await response.json();

    // ResponseEntity 구조에서 data 필드 추출
    const isDuplicate = responseData.data;
    // isDuplicate가 true이면 이메일이 중복됨

    console.log("핸드폰 중복 확인 결과:", isDuplicate);

    if (isDuplicate) {
      alert("이미 존재하는 핸드폰 번호입니다.");
      return true;
    } else {
      alert("사용 가능한 핸드폰 번호입니다.");
      return false;
    }
  } catch (error) {
    console.error("핸드폰 중복 확인 실패:", error);
    alert("이메일 중복 확인 중 오류가 발생했습니다.");
    return false;
  }
};

export const sendAuthCode = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sms/certificationNumber`,
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
    alert("인증번호 발송 중 오류가 발생했습니다.");
    return false;
  }
};

export const verifyAuthCode = async (
  phoneNumber: string,
  authCode: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sms/verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, authCode }),
      }
    );

    if (!response.ok) {
      throw new Error("서버 응답이 실패했습니다.");
    }

    const responseData = await response.json();
    console.log("핸드폰 인증번호 확인 결과:", responseData);

    // ResponseEntity 구조에서 status 필드 확인
    if (responseData.statusCode === 200) {
      alert("핸드폰 인증이 완료되었습니다.");
      return true;
    } else {
      alert("인증번호가 올바르지 않습니다.");
      return false;
    }
  } catch (error) {
    console.error("인증번호 확인 실패 - 인증번호 올바르지 않은거임:", error);
    return false;
  }
};
