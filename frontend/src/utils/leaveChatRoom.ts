import { Client } from "@stomp/stompjs";

export const leaveChatRoom = async (
  client: Client | null,
  roomId: number,
  userId: number
): Promise<void> => {
  if (!client || !client.connected) {
    console.error("STOMP 연결이 활성화되지 않았습니다.");
    return;
  }

  // 1. LEAVE 메시지 발행
  const leaveMessagePayload = {
    type: "LEAVE",
    userId: userId,
    roomId: roomId,
    message: "퇴장", // 메시지 내용은 null
  };

  client.publish({
    destination: `/pub/chat/${roomId}`,
    body: JSON.stringify(leaveMessagePayload),
  });

  console.log("LEAVE 메시지 발행:", leaveMessagePayload);

  // 2. 채팅방 나가기 API 호출
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/${roomId}/leave`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("채팅방 나가기 중 오류가 발생했습니다.");
    }

    console.log("채팅방 나가기 성공");
    alert("채팅방을 나갔습니다.");
    window.location.reload(); // 새로고침
  } catch (error) {
    console.error("채팅방 나가기 실패:", error);
    alert("채팅방 나가기에 실패했습니다.");
  }
};
