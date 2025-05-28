import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { FaUser, FaTimes, FaDoorOpen } from "react-icons/fa"; // 아이콘 추가
import { fetchParticipants, Participant } from "../../utils/fetchParticipants";
import { leaveChatRoom } from "../../utils/leaveChatRoom";

interface Props {
  roomId: number;
  client: Client | null;
  loginUserId: number;
  onClose: () => void;
}

interface ChatResponseDto {
  roomId: number;
  sender: string;
  message: string;
  userId: number;
  createDate: string;
  chatStatus: string;
}

interface ChatRoomResponseDto {
  id: number;
  roomName: string;
  roomType: string;
}

interface OpponentResponseDto {
  name: string;
  department: string | null;
}

const Chat: React.FC<Props> = ({ roomId, client, loginUserId, onClose }) => {
  const [roomInfo, setRoomInfo] = useState<ChatRoomResponseDto | null>(null);
  const [opponentInfo, setOpponentInfo] = useState<OpponentResponseDto | null>(
    null
  );
  const [messages, setMessages] = useState<ChatResponseDto[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]); // 참여 유저 목록 상태
  const [showParticipants, setShowParticipants] = useState<boolean>(false); // 참여 유저 목록 표시 여부
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // 스크롤 이동을 위한 ref
  const messageContainerRef = useRef<HTMLDivElement | null>(null); // 메시지 컨테이너 ref 추가

  // 참여 유저 목록 가져오기
  const loadParticipants = async () => {
    try {
      const participantList = await fetchParticipants(roomId);
      setParticipants(participantList);
    } catch (error) {
      console.error("참여 유저 목록 로드 실패:", error);
    }
  };

  // 스크롤을 가장 아래로 이동 - 개선된 버전
  const scrollToBottom = () => {
    // setTimeout을 사용하여 DOM 업데이트 후 스크롤 실행
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (messageContainerRef.current) {
        // 대체 방법: 컨테이너의 scrollTop 사용
        const container = messageContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    }, 100); // 약간의 지연으로 메시지 렌더링 보장
  };

  // 채팅방 입장 시간 업데이트 함수
  const updateEnterTime = async () => {
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

  // 채팅방 메시지 초기 로드
  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/${roomId}?page=1&size=20`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // 쿠키 포함
          }
        );

        if (!response.ok) {
          throw new Error("채팅 메시지를 가져오는 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        console.log("로드된 메시지:", data.data.content);
        setMessages(data.data.content.reverse()); // 최신 메시지가 아래로 가도록 정렬

        // 채팅방 입장 시간 업데이트 (이렇게 하면 메시지를 로드할 때 자동으로 업데이트됨)
        updateEnterTime();
      } catch (error) {
        console.error("채팅 메시지 로드 실패:", error);
      }
    };

    fetchChatMessages();
  }, [roomId]);

  // 메시지가 변경될 때마다 스크롤 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket 구독
  useEffect(() => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    const subscription = client.subscribe(`/sub/chat/${roomId}`, (message) => {
      const response = JSON.parse(message.body); // 서버에서 발행된 메시지 파싱
      const receivedMessage: ChatResponseDto = response.data; // ApiResponse의 data 필드 추출
      console.log("수신된 메시지:", response); // 디버깅용 로그
      setMessages((prevMessages) => [...prevMessages, receivedMessage]); // 메시지 추가
      // scrollToBottom()은 여기서 호출하지 않음 - useEffect에서 처리

      // 자신이 보낸 메시지인 경우 lastEnterTime 업데이트
      if (receivedMessage.userId === loginUserId) {
        updateEnterTime();
      }
    });

    return () => {
      subscription.unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    };
  }, [roomId, client, loginUserId]);

  //채팅방 나가기
  const handleLeaveChatRoom = async () => {
    try {
      await leaveChatRoom(client, roomId, loginUserId);
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
    }
  };

  // 메시지 전송 - 수정된 부분
  const sendMessage = async () => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    if (inputMessage.trim()) {
      const messagePayload = {
        type: "TALK", // 메시지 타입
        userId: loginUserId, // 로그인 유저 ID
        roomId,
        message: inputMessage,
      };

      client.publish({
        destination: `/pub/chat/${roomId}`,
        body: JSON.stringify(messagePayload),
      });

      setInputMessage(""); // 입력 필드 초기화

      // 메시지 전송 시 lastEnterTime 업데이트 (추가)
      // WebSocket에서 자신의 메시지를 받을 때 업데이트하므로 여기서는 제거
    }
  };

  // Enter 키 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    onClose(); // 부모 컴포넌트로 콜백 호출
    window.location.reload(); // 화면 새로 고침
  };

  // 메시지를 날짜별로 그룹화
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.createDate).toLocaleDateString(); // 메시지 날짜
    if (!acc[date]) {
      acc[date] = []; // 날짜별로 배열 초기화
    }
    acc[date].push(message); // 메시지 추가
    return acc;
  }, {} as Record<string, ChatResponseDto[]>);

  // 채팅방 정보 가져오기
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/${roomId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("채팅방 정보를 가져오는 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        setRoomInfo(data.data);
      } catch (error) {
        console.error("채팅방 정보 로드 실패:", error);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  // 상대방 정보 가져오기 (1:1 채팅방일 경우)
  useEffect(() => {
    if (roomInfo?.roomType !== "GROUP") {
      const fetchOpponentInfo = async () => {
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
          setOpponentInfo(data.data);
        } catch (error) {
          console.error("상대방 정보 로드 실패:", error);
        }
      };

      fetchOpponentInfo();
    }
  }, [roomId, roomInfo]);

  // 컴포넌트 마운트 시 스크롤 한 번 더 호출
  useEffect(() => {
    // 약간의 지연 후 스크롤
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 500); // 500ms 지연으로 컴포넌트가 완전히 렌더링된 후 스크롤 시도

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async () => {
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

    // 페이지를 떠날 때 lastEnterTime 업데이트
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId]);

  return (
    <div className="flex flex-col h-[90vh] border border-gray-300 rounded-lg shadow-md">
      {/* 채팅방 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <div>
          <h2 className="text-xl font-bold">
            {roomInfo?.roomType === "GROUP"
              ? roomInfo.roomName
              : `${opponentInfo?.name || "알 수 없음"} 채팅방`}
          </h2>
          {roomInfo?.roomType !== "GROUP" && opponentInfo?.department && (
            <p className="text-sm text-gray-500">{opponentInfo.department}</p>
          )}
        </div>
        {/* 닫기 및 나가기 버튼 */}
        <div className="flex items-center">
          {/* 참여 유저 목록 버튼 */}
          <button
            className="text-gray-600 hover:text-gray-800 mr-4"
            onClick={() => {
              setShowParticipants(!showParticipants);
              if (!showParticipants) loadParticipants(); // 참여 유저 목록 가져오기
            }}
          >
            <FaUser size={24} />
          </button>
          {/* 닫기 버튼 */}
          <button
            className="text-gray-600 hover:text-gray-800 mr-4"
            onClick={handleClose} // 닫기 버튼 클릭 시 화면 새로 고침
          >
            <FaTimes size={24} /> {/* x 아이콘 */}
          </button>
          {/* 나가기 버튼 */}
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => leaveChatRoom(client, roomId, loginUserId)}
          >
            <FaDoorOpen size={24} /> {/* 문 아이콘 */}
          </button>
        </div>
      </div>

      {/* 참여 유저 목록 */}
      {showParticipants && (
        <div className="absolute top-16 right-4 bg-white border border-gray-300 rounded shadow-lg p-4 w-64 z-50">
          <h3 className="text-lg font-bold mb-2">참여 유저</h3>
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li key={participant.id} className="text-gray-700">
                {participant.name}
              </li>
            ))}
          </ul>
          <button
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full"
            onClick={() => setShowParticipants(false)} // 닫기
          >
            닫기
          </button>
        </div>
      )}

      {/* 채팅 메시지 영역 - ref 추가 */}
      <div
        className="flex-1 overflow-y-auto p-4"
        ref={messageContainerRef}
        style={{ scrollBehavior: "smooth" }}
      >
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            {/* 날짜 표시 */}
            <div className="flex justify-center my-4">
              <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm">
                {date}
              </span>
            </div>

            {/* 메시지 목록 */}
            {groupedMessages[date].map((msg, index) => {
              const isMyMessage = msg.userId === loginUserId; // 본인이 보낸 메시지인지 확인
              return (
                <div
                  key={index}
                  className={`flex flex-col ${
                    isMyMessage ? "items-end" : "items-start"
                  } mb-2`}
                >
                  {/* 보낸 사람 이름 표시 */}
                  {!isMyMessage && (
                    <span className="text-sm font-semibold text-gray-800 mb-1">
                      {msg.sender || "알 수 없음"}
                    </span>
                  )}
                  <div
                    className={`p-2 rounded-lg max-w-xs ${
                      isMyMessage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                  {/* 시간 표시 */}
                  {msg.chatStatus !== "ENTER" && (
                    <small className="text-xs text-gray-500 mt-1">
                      {new Date(msg.createDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Seoul",
                      })}
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* 스크롤 이동을 위한 빈 div */}
        <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
      </div>

      {/* 메시지 입력 영역 */}
      <div className="flex items-center p-4 border-t border-gray-300">
        <input
          type="text"
          className="flex-1 border border-gray-300 p-2 rounded-l"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress} // Enter 키 처리 추가
          placeholder="메시지를 입력하세요..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          onClick={sendMessage}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default Chat;
