import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { leaveChatRoom } from "../../utils/leaveChatRoom";

interface ChatRoom {
  id: number;
  roomName: string;
  roomType: string;
}

interface OpponentInfo {
  name: string;
  department: string;
}

interface Props {
  onSelectRoom: (roomId: number) => void; // 선택된 채팅방 ID를 부모 컴포넌트로 전달
  client: Client | null; // WebSocket 클라이언트
  loginUserId: number; // 현재 로그인한 유저 ID
  roomType: string; // 채팅방 타입 (GROUP, ONE_TO_ONE 등)
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
  const [newMessages, setNewMessages] = useState<{ [key: number]: boolean }>(
    {}
  ); // 채팅방별 새 메시지 여부
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null); // 현재 열려 있는 채팅방 ID

  const [opponentInfo, setOpponentInfo] = useState<{
    [key: number]: OpponentInfo;
  }>({});

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
        throw new Error("상대방 정보를 가져오는 중 오류가 발생했습니다.");
      }

      const data = await response.json();

      setOpponentInfo((prev) => ({
        ...prev,
        [roomId]: {
          name: data.data.name || "알 수 없음",
          department: data.data.department || " ",
        },
      }));
    } catch (err) {
      console.error(`상대방 정보 로드 실패 (채팅방 ID: ${roomId}):`, err);
    }
  };

  // 특정 채팅방의 상대방 정보 가져오기
  const fetchOpponentInfo = async (roomId: number) => {
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
        throw new Error("상대방 정보를 가져오는 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setOpponentInfo((prev) => ({
        ...prev,
        [roomId]: {
          name: data.data.name || "알 수 없음",
          department: data.data.department || "부서 정보 없음",
        },
      }));
    } catch (err) {
      console.error(`상대방 정보 로드 실패 (채팅방 ID: ${roomId}):`, err);
    }
  };

  useEffect(() => {
    if (roomType !== "GROUP") {
      chatRooms.forEach((room) => {
        fetchOpponentName(room.id);
      });
    }
  }, [chatRooms, roomType]);

  // 특정 채팅방의 새 메시지 여부 확인
  const fetchNewMessageStatus = async (roomId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/${roomId}/has-new-message`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("새 메시지 여부를 가져오는 중 오류가 발생했습니다.");
      }

      const data = await response.json();

      setNewMessages((prev) => ({
        ...prev,
        [roomId]: data.data, // true 또는 false
      }));
      console.log(`채팅방 ${roomId}의 새 메시지 여부:`, data.data);
    } catch (err) {
      console.error(`새 메시지 여부 로드 실패 (채팅방 ID: ${roomId}):`, err);
    }
  };

  useEffect(() => {
    // 모든 채팅방의 새 메시지 여부 확인
    chatRooms.forEach((room) => {
      fetchNewMessageStatus(room.id);
    });
  }, [chatRooms]);

  // WebSocket 메시지 수신 시 처리
  useEffect(() => {
    const subscriptions: { [key: number]: boolean } = {};

    if (client && client.connected) {
      chatRooms.forEach((room) => {
        if (!subscriptions[room.id]) {
          client.subscribe(`/sub/chat/${room.id}`, (message) => {
            if (currentRoomId !== room.id) {
              // 현재 열려 있는 채팅방이 아닌 경우에만 NEW 상태 설정
              setNewMessages((prev) => ({
                ...prev,
                [room.id]: true,
              }));
            }
          });
          subscriptions[room.id] = true; // 구독 상태 저장
        }
      });
    }
  }, [client, chatRooms, currentRoomId]);

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
        setCurrentRoomId(roomId); // 현재 열려 있는 채팅방 ID 설정
        onSelectRoom(roomId); // 채팅방만 보이게 설정
        await updateEnterTime(roomId);
      } else {
        // 입장하지 않은 경우
        console.log(`입장하지 않은 채팅방: ${roomId}`);
        await updateEnterTime(roomId); // 입장 시간 업데이트
        enterRoom(roomId); // 입장 처리
      }

      // NEW 상태 제거
      setNewMessages((prev) => ({
        ...prev,
        [roomId]: false,
      }));
    } catch (error) {
      console.error("입장 검증 실패:", error);
    }
  };

  // 채팅방 입장 시간 업데이트
  const updateEnterTime = async (roomId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/${roomId}/enter`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("채팅방 입장 시간 업데이트 중 오류가 발생했습니다.");
      }

      console.log(`채팅방 ${roomId} 입장 시간 업데이트 성공`);
    } catch (error) {
      console.error(`채팅방 ${roomId} 입장 시간 업데이트 실패:`, error);
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
    setCurrentRoomId(roomId); // 현재 열려 있는 채팅방 ID 설정
    onSelectRoom(roomId);

    // NEW 상태 제거
    setNewMessages((prev) => ({
      ...prev,
      [roomId]: false,
    }));
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="h-full overflow-y-auto bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">채팅방 리스트</h2>
      <ul className="divide-y divide-gray-200">
        {chatRooms.map((room) => {
          const opponent = opponentInfo[room.id];
          const displayName =
            roomType === "GROUP" ? room.roomName : opponent?.name || "로딩중..";
          const department =
            roomType !== "GROUP" && opponent?.department
              ? opponent.department
              : null;

          return (
            <li
              key={room.id}
              className="flex justify-between items-center py-3 hover:bg-gray-100 cursor-pointer"
            >
              {/* 채팅방 이름 및 부서 */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{displayName}</span>
                {department && (
                  <span className="text-sm text-gray-500">{department}</span>
                )}
              </div>

              {/* NEW 뱃지 */}
              {newMessages[room.id] && currentRoomId !== room.id && (
                <span className="text-white bg-blue-500 rounded-full px-2 py-1 text-xs font-bold">
                  NEW
                </span>
              )}

              {/* 버튼 영역 */}
              <div className="flex gap-2">
                {/* 입장 버튼 */}
                <button
                  className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-100"
                  onClick={() => validateAndEnterRoom(room.id)} // 입장 검증 및 처리
                >
                  입장
                </button>

                {/* 나가기 버튼 */}
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
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
