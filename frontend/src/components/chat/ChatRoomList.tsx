import React, { useEffect, useState } from "react";
import { Client, Message } from "@stomp/stompjs";
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
  roomType: string; // 채팅방 타입 (ONE_TO_ONE, SUPPORT 등)
}

const ChatRoomList: React.FC<Props> = ({
  onSelectRoom,
  client,
  loginUserId,
  roomType,
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [opponentNames, setOpponentNames] = useState<{ [key: number]: string }>(
    {}
  ); // 채팅방별 상대방 이름

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms?chatRoomType=${roomType}&page=1&size=10`,
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
  }, [roomType]); // roomType이 변경될 때마다 호출

  // 특정 채팅방의 상대방 이름 가져오기
  const fetchOpponentName = async (roomId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/${roomId}/opponent`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("상대방 이름을 가져오는 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setOpponentNames((prev) => ({
        ...prev,
        [roomId]: data.data || "종료된 채팅", // 상대방 이름이 null이면 "종료된 채팅"으로 설정
      }));
    } catch (err) {
      console.error(`상대방 이름 로드 실패 (채팅방 ID: ${roomId}):`, err);
    }
  };

  useEffect(() => {
    // 모든 채팅방의 상대방 이름 가져오기
    chatRooms.forEach((room) => {
      fetchOpponentName(room.id);
    });
  }, [chatRooms]);

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
        {chatRooms.map((room) => {
          const opponentName = opponentNames[room.id] || "로딩중.."; // 상대방 이름 또는 로딩 중 표시

          return (
            <li
              key={room.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>{opponentName}</span>
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
          );
        })}
      </ul>
    </div>
  );
};

export default ChatRoomList;
