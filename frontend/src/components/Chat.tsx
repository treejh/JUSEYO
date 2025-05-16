import React, { useEffect, useState } from "react";
import { Client, Message } from "@stomp/stompjs";
import { FaUser } from "react-icons/fa"; // 사람 아이콘 사용
import { fetchParticipants, Participant } from "../utils/fetchParticipants"; // 참여 유저 목록 가져오기 함수 임포트

interface Props {
  roomId: number; // 선택된 채팅방 ID
  client: Client | null; // WebSocket 클라이언트
  loginUserId: number; // 현재 로그인한 유저 ID
}

interface ChatResponseDto {
  roomId: number; // 방 번호
  sender: string; // 보낸 사람 닉네임
  message: string; // 메시지 내용
  createDate: string; // ISO 형식의 날짜 문자열
  chatStatus: string; // ChatStatus (예: "ENTER", "TALK")
}

const Chat: React.FC<Props> = ({ roomId, client, loginUserId }) => {
  const [messages, setMessages] = useState<ChatResponseDto[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]); // 참여 유저 목록 상태
  const [showParticipants, setShowParticipants] = useState<boolean>(false); // 참여 유저 목록 표시 여부

  // 참여 유저 목록 가져오기
  const loadParticipants = async () => {
    try {
      const participantList = await fetchParticipants(roomId);
      setParticipants(participantList);
    } catch (error) {
      console.error("참여 유저 목록 로드 실패:", error);
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
        setMessages(data.data.content.reverse()); // 최신 메시지가 아래로 가도록 정렬
      } catch (error) {
        console.error("채팅 메시지 로드 실패:", error);
      }
    };

    fetchChatMessages();
  }, [roomId]);

  // WebSocket 구독
  useEffect(() => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    const subscription = client.subscribe(
      `/sub/chat/${roomId}`,
      (message: Message) => {
        const response = JSON.parse(message.body); // 서버에서 발행된 메시지 파싱
        const receivedMessage: ChatResponseDto = response.data; // ApiResponse의 data 필드 추출
        setMessages((prevMessages) => [...prevMessages, receivedMessage]); // 메시지 추가
      }
    );

    return () => {
      subscription.unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    };
  }, [roomId, client]);

  // 메시지 전송
  const sendMessage = () => {
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
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">채팅방</h2>
        <button
          className="text-gray-600 hover:text-gray-800"
          onClick={() => {
            setShowParticipants(!showParticipants);
            if (!showParticipants) loadParticipants(); // 참여 유저 목록 가져오기
          }}
        >
          <FaUser size={24} />
        </button>
      </div>

      {showParticipants && (
        <div className="absolute top-16 right-4 bg-white border rounded shadow-lg p-4 w-64 z-50">
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

      <div className="h-64 overflow-y-auto border p-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 border-b">
            <strong>{msg.sender}</strong>: {msg.message} <br />
            <small>{new Date(msg.createDate).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 border p-2 rounded-l"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
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
