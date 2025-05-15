import React, { useEffect, useState } from "react";
import { Client, Message } from "@stomp/stompjs";

interface Props {
  roomId: number; // 선택된 채팅방 ID
  client: Client | null; // WebSocket 클라이언트
  loginUserId: number; // 현재 로그인한 유저 ID
}

interface ChatResponseDto {
  roomId: number;
  sender: string;
  message: string;
  createDate: string; // ISO 형식의 날짜 문자열
  chatStatus: string; // ChatStatus (예: "ENTER", "TALK")
}

const Chat: React.FC<Props> = ({ roomId, client, loginUserId }) => {
  const [messages, setMessages] = useState<ChatResponseDto[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    // WebSocket 구독 설정
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

  const sendMessage = () => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    if (inputMessage.trim()) {
      const messagePayload = {
        type: "TALK", // 메시지 타입
        userId: loginUserId, // 테스트용 유저 ID (실제 로그인 유저 ID 사용)
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
      <h2 className="text-xl font-bold mb-4">채팅방</h2>
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
