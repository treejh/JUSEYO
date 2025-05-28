import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { leaveChatRoom } from "../../utils/leaveChatRoom";
import { useCustomToast } from "@/utils/toast";

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
  roomType = "", // 기본값 추가
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

  const [searchQuery, setSearchQuery] = useState<string>(""); // 검색어 상태
  const [filteredChatRooms, setFilteredChatRooms] = useState<ChatRoom[]>([]); // 필터링된 채팅방 리스트
  const toast = useCustomToast();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true); // 새로고침 시 로딩 상태 초기화
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
        setLoading(false); // 로딩 상태 해제
      }
    };

    fetchChatRooms();

    // 새로고침 시에도 실행되도록 설정
    window.addEventListener("load", fetchChatRooms);

    return () => {
      window.removeEventListener("load", fetchChatRooms);
    };
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

      // 상대방 정보가 null이면 name만 "알 수 없음"으로 저장
      if (!data.data) {
        console.warn(`채팅방 ID ${roomId}의 상대방 정보가 없습니다.`);
        setOpponentInfo((prev) => ({
          ...prev,
          [roomId]: {
            name: "종료된 채팅방", // name만 "알 수 없음"으로 설정
            department: "", // department는 빈 문자열로 설정
          },
        }));
        return;
      }
      console.log("상대방 정보:", data.data);
      setOpponentInfo((prev) => ({
        ...prev,
        [roomId]: {
          name: data.data.name || "알 수 없음",
          department: data.data.department || " ",
        },
      }));
    } catch (err) {
      console.error(`상대방 정보 로드 실패 (채팅방 ID: ${roomId}):`, err);
      // 에러 발생 시 기본값 설정
      setOpponentInfo((prev) => ({
        ...prev,
        [roomId]: {
          name: "정보 없음",
          department: "",
        },
      }));
    }
  };

  useEffect(() => {
    if (roomType !== "GROUP" && chatRooms && chatRooms.length > 0) {
      chatRooms.forEach((room) => {
        if (room && room.id) {
          fetchOpponentName(room.id);
        }
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
    if (chatRooms && chatRooms.length > 0) {
      chatRooms.forEach((room) => {
        if (room && room.id) {
          fetchNewMessageStatus(room.id);
        }
      });
    }
  }, [chatRooms]);

  // WebSocket 메시지 수신 시 처리 - 수정된 부분
  useEffect(() => {
    const subscriptions: { [key: number]: boolean } = {};

    if (client && client.connected && chatRooms && chatRooms.length > 0) {
      chatRooms.forEach((room) => {
        if (room && room.id && !subscriptions[room.id]) {
          client.subscribe(`/sub/chat/${room.id}`, (messageEvent) => {
            try {
              // 메시지 파싱
              const response = JSON.parse(messageEvent.body);
              const chatMessage = response.data;

              // 현재 열려 있는 채팅방이 아니고, 본인이 보낸 메시지가 아닌 경우에만 NEW 상태 설정
              if (
                currentRoomId !== room.id &&
                chatMessage.userId !== loginUserId
              ) {
                console.log(
                  `채팅방 ${room.id}에 새 메시지 수신 (발신자: ${chatMessage.userId})`
                );
                setNewMessages((prev) => ({
                  ...prev,
                  [room.id]: true,
                }));
              } else {
                console.log(
                  `채팅방 ${room.id}에 메시지 수신 (현재방 또는 본인 메시지)`
                );
              }
            } catch (error) {
              console.error("메시지 처리 오류:", error);
            }
          });
          subscriptions[room.id] = true; // 구독 상태 저장
        }
      });
    }

    return () => {
      // 컴포넌트 언마운트 시 구독 해제 (선택적)
      // 실제로는 StompJS 클라이언트가 자체적으로 연결 해제 시 구독을 정리함
    };
  }, [client, chatRooms, currentRoomId, loginUserId]);

  const validateAndEnterRoom = async (roomId: number) => {
    try {
      // 현재 열려 있는 채팅방이 있는지 확인
      if (currentRoomId && currentRoomId !== roomId) {
        toast.error(
          "현재 열려 있는 채팅방을 닫아야 다른 채팅방에 입장할 수 있습니다."
        );
        return;
      }

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

  // 검색어 변경 시 필터링 - 방어적인 코드로 수정
  useEffect(() => {
    // 방어적 검사 추가
    if (!chatRooms || !roomType) {
      setFilteredChatRooms([]);
      return;
    }

    try {
      const filtered = chatRooms.filter((room) => {
        if (!room) return false;

        let displayName = "";
        if (roomType === "GROUP") {
          displayName = room.roomName || "";
        } else {
          displayName = opponentInfo[room.id]?.name || "";
        }

        // 방어적 검사를 통한 안전한 비교
        const query = (searchQuery || "").toLowerCase();
        return (
          typeof displayName === "string" &&
          displayName.toLowerCase().includes(query)
        );
      });
      setFilteredChatRooms(filtered);
    } catch (err) {
      console.error("필터링 중 오류:", err);
      setFilteredChatRooms([]); // 오류 시 빈 배열로 설정
    }
  }, [searchQuery, chatRooms, roomType, opponentInfo]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="h-full bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">채팅방 리스트</h2>

      {/* 검색 입력 필드 */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            roomType === "GROUP"
              ? "채팅방 이름으로 검색"
              : "상대방 이름으로 검색"
          }
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 채팅방 리스트: 최대 10개, 초과 시 스크롤 */}
      <div className="max-h-[440px] overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {(filteredChatRooms || []).map((room) => {
            if (!room) return null;

            let displayName = "알 수 없음";
            let department = null;

            try {
              if (roomType === "GROUP") {
                displayName = room.roomName || "알 수 없음";
              } else {
                displayName = opponentInfo[room.id]?.name || "로딩중..";
                department = opponentInfo[room.id]?.department || null;
              }
            } catch (err) {
              console.error("표시명 가져오기 오류:", err);
            }

            return (
              <li
                key={room.id}
                className="flex justify-between items-center py-4 hover:bg-gray-100 cursor-pointer"
              >
                {/* 채팅방 이름 및 부서 */}
                <div className="flex flex-col min-w-0 flex-1 relative">
                  {/* NEW 뱃지: 이름 위에, 오른쪽 상단에 작게 */}
                  {newMessages[room.id] && currentRoomId !== room.id && (
                    <span className="absolute -top-5 left-0 text-white bg-blue-500 rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow">
                      NEW
                    </span>
                  )}

                  <span
                    className="font-medium text-gray-800 truncate"
                    title={displayName}
                  >
                    {displayName}
                  </span>
                  {department && (
                    <span
                      className="text-sm text-gray-500 truncate"
                      title={department}
                    >
                      {department}
                    </span>
                  )}
                </div>

                {/* 버튼 영역: 고정 너비와 shrink 방지 */}
                <div className="flex gap-2 min-w-[120px] flex-shrink-0 justify-end ml-4">
                  <button
                    className="border border-blue-500 text-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-100"
                    onClick={() => validateAndEnterRoom(room.id)}
                  >
                    입장
                  </button>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    onClick={() => leaveChatRoom(client, room.id, loginUserId)}
                  >
                    나가기
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ChatRoomList;
