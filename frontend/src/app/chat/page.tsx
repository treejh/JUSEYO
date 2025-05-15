"use client";

import React, { useEffect, useState } from "react";
import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatPage = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const roomId = 1; // 테스트용 Room ID
  const username = "jihyun1"; // 사용자 이름

  useEffect(() => {
    // // 쿠키에서 accessToken 추출
    // const getAccessTokenFromCookie = () => {
    //   const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    //   const accessTokenCookie = cookies.find((cookie) =>
    //     cookie.startsWith("accessToken=")
    //   );
    //   return accessTokenCookie ? accessTokenCookie.split("=")[1] : null;
    // };

    // const accessToken = getAccessTokenFromCookie();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-stomp"),
      debug: (str) => console.log(str),
      //   connectHeaders: {
      //     Authorization: `Bearer ${accessToken}`, // 헤더에 accessToken 추가
      //   },
      onConnect: () => {
        console.log("WebSocket 연결 성공");

        // 채팅방 구독 (sub)
        stompClient.subscribe(`/sub/chat/${roomId}`, (message: Message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [
            ...prevMessages,
            `${receivedMessage.username}: ${receivedMessage.message}`,
          ]);
        });

        // 채팅방 입장 메시지 발행 (pub)
        const enterMessagePayload = {
          ChatMessageStatus: "ENTER",
          roomId,
          message: "enter",
        };

        stompClient.publish({
          destination: `/pub/chat/${roomId}`,
          body: JSON.stringify(enterMessagePayload),
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

  const sendMessage = () => {
    if (!client || !client.connected) {
      console.error("STOMP 연결이 활성화되지 않았습니다.");
      return;
    }

    if (inputMessage.trim()) {
      const messagePayload = {
        ChatMessageStatus: "TALK",
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
              {msg}
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
            className="bg-blue-500 text-white p-2 rounded-r"
            onClick={sendMessage}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
