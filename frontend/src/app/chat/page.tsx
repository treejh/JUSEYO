"use client";

import React, { useEffect, useState } from "react";
import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

const ChatPage = () => {
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

  useEffect(() => {
    // 쿠키에서 accessToken 추출
    const getAccessTokenFromCookie = () => {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.startsWith("accessToken=")
      );
      return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
    };

    const accessToken = getAccessTokenFromCookie();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-stomp"),
      debug: (str) => console.log(str),
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
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const enterRoom = () => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    const enterMessagePayload = {
      type: "ENTER",
      userId: loginUser.id,
      roomId,
      message: "enter",
    };

    client.publish({
      destination: `/pub/chat/${roomId}`,
      body: JSON.stringify(enterMessagePayload),
    });

    console.log("ENTER 메시지 발행");
  };

  const sendMessage = () => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    if (inputMessage.trim()) {
      const messagePayload = {
        type: "TALK",
        userId: loginUser.id,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">채팅 테스트</h1>
      <div className="w-full max-w-md border p-4 rounded shadow">
        <div className="h-64 overflow-y-auto border-b mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="p-2 border-b">
              <strong>{msg.sender}</strong>: {msg.message} <br />
              <small>{new Date(msg.createDate).toLocaleString()}</small>
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
              className="flex-1 border p-2 rounded-l"
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
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
