import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { leaveChatRoom } from "../../utils/leaveChatRoom"; // 나가기 로직 임포트

interface ChatRoom {
  id: number;
  roomName: string;
  roomType: string;
}

interface Props {
  onSelectRoom: (roomId: number) => void; // 선택된 채팅방 ID를 부모 컴포넌트로 전달
  client: Client | null; // WebSocket 클라이언트
  loginUserId: number; // 현재 로그인한 유저 ID
}

const ChatRoomList: React.FC<Props> = ({
  onSelectRoom,
  client,
  loginUserId,
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms?chatRoomType=ONE_TO_ONE&page=1&size=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("채팅방 리스트를 가져오는 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        setChatRooms(data.data.content); // 채팅방 리스트 데이터
      } catch (err) {
        setError("채팅방 리스트를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  useEffect(() => {
    const subscriptions: { [key: number]: boolean } = {};

    if (client && client.connected) {
      chatRooms.forEach((room) => {
        if (!subscriptions[room.id]) {
          client.subscribe(`/sub/chat/${room.id}`, (message) => {
            console.log(`채팅방 ${room.id}에서 메시지 수신:`, message.body);
          });
          subscriptions[room.id] = true; // 구독 상태 저장
        }
      });
    }
  }, [client, chatRooms]);

  const validateAndEnterRoom = async (roomId: number) => {
    try {
      // 입장 검증 API 호출
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/enter/valid/${roomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("입장 검증 중 오류가 발생했습니다.");
      }

      const data = await response.json();

      if (data.data) {
        // 이미 입장한 경우
        console.log(`이미 입장한 채팅방: ${roomId}`);
        onSelectRoom(roomId); // 채팅방만 보이게 설정
      } else {
        // 입장하지 않은 경우
        console.log(`입장하지 않은 채팅방: ${roomId}`);
        enterRoom(roomId); // 입장 처리
      }
    } catch (error) {
      console.error("입장 검증 실패:", error);
    }
  };

  const enterRoom = (roomId: number) => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    const enterMessagePayload = {
      type: "ENTER",
      userId: loginUserId,
      roomId,
      message: "enter",
    };

    client.publish({
      destination: `/pub/chat/${roomId}`,
      body: JSON.stringify(enterMessagePayload),
    });

    console.log("ENTER 메시지 발행:", enterMessagePayload);

    // 선택된 채팅방 ID를 부모 컴포넌트로 전달
    onSelectRoom(roomId);
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">채팅방 리스트</h2>
      <ul className="space-y-2">
        {chatRooms.map((room) => (
          <li
            key={room.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{room.roomName}</span>
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => validateAndEnterRoom(room.id)} // 입장 검증 및 처리
              >
                채팅방 입장
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => leaveChatRoom(client, room.id, loginUserId)} // 나가기 로직 호출
              >
                나가기
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatRoomList;
