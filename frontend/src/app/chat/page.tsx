"use client";
import React, { useEffect, useState } from "react";
import UserList from "@/components/UserList";
import ChatRoomList from "@/components/ChatRoomList";
import Chat from "@/components/Chat";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

<<<<<<< HEAD
const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [client, setClient] = useState<Client | null>(null); // WebSocket 클라이언트 상태
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보
  const managementDashboardName = loginUser.managementDashboardName; // 관리 페이지 이름
=======
const ChatPage: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatResponseDto[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const roomId = 6; // 테스트용 Room ID
  const { loginUser, isLogin } = useGlobalLoginUser();

  // ChatResponseDto 타입 정의
  interface ChatResponseDto {
    roomId: number;
    sender: string;
    message: string;
    createDate: string; // ISO 형식의 날짜 문자열
    chatStatus: string; // ChatStatus (예: "ENTER", "TALK")
  }
>>>>>>> da2b63d22901159e630a4e89819912d4d69b6657

  // WebSocket 클라이언트 초기화
  useEffect(() => {
    const stompClient = new Client({
<<<<<<< HEAD
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`),
      debug: (str) => console.log(str),
=======
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-stomp"),
      debug: (str: string) => console.log(str),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // 헤더에 accessToken 추가
      },
      onConnect: () => {
        console.log("WebSocket 연결 성공");

        // 채팅방 구독 (sub)
        stompClient.subscribe(`/sub/chat/${roomId}`, (message: Message) => {
          const response = JSON.parse(message.body); // 전체 응답 파싱
          const receivedMessage: ChatResponseDto = response.data; // data 필드 추출
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      },
      onDisconnect: () => {
        console.log("WebSocket 연결 끊김");
      },
>>>>>>> da2b63d22901159e630a4e89819912d4d69b6657
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
<<<<<<< HEAD
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">채팅 시스템</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <UserList
            onSelectUser={(userId) => console.log(`유저 ${userId} 선택됨`)}
            managementDashboardName={managementDashboardName || ""}
          />
        </div>
        <div>
          <ChatRoomList
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)} // 선택된 채팅방 ID 설정
            client={client} // WebSocket 클라이언트 전달
            loginUserId={loginUser.id} // 로그인 유저 ID 전달
          />
        </div>
        <div>
          {selectedRoomId ? (
            <Chat
              roomId={selectedRoomId}
              client={client}
              loginUserId={loginUser.id}
            /> // WebSocket 클라이언트 전달
          ) : (
            <p>채팅방을 선택하세요.</p>
          )}
=======
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4 text-black">채팅 테스트</h1>
      <div className="w-full max-w-md border border-gray-300 p-4 rounded shadow bg-white">
        <div className="h-64 overflow-y-auto border-b border-gray-300 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="p-2 border-b border-gray-200 text-black">
              <strong className="text-black">{msg.sender}</strong>: {msg.message} <br />
              <small className="text-gray-600">{new Date(msg.createDate).toLocaleString()}</small>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={enterRoom}
          >
            채팅방 입장 (ENTER)
          </button>
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 p-2 rounded-l text-black"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button
              className="bg-blue-500 text-white p-2 rounded-r"
              onClick={sendMessage}
            >
              전송 (TALK)
            </button>
          </div>
>>>>>>> da2b63d22901159e630a4e89819912d4d69b6657
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
