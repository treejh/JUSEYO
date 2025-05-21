export interface Participant {
  id: number; // 유저 ID
  name: string; // 유저 이름
}

export const fetchParticipants = async (
  chatRoomId: number
): Promise<Participant[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/participants?chatRoomId=${chatRoomId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("참여 유저 목록을 가져오는 중 오류가 발생했습니다.");
    }

    const data = await response.json();
    return data.data; // 참여 유저 목록 반환
  } catch (err) {
    console.error("참여 유저 목록 로드 실패:", err);
    throw err; // 호출한 곳에서 에러 처리
  }
};
