"use client";

import React, { useEffect, useState } from "react";
import UserList from "@/components/chat/UserList";
import ChatRoomList from "@/components/chat/ChatRoomList";
import Chat from "@/components/chat/Chat";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [client, setClient] = useState<Client | null>(null); // WebSocket 클라이언트 상태
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보
  const managementDashboardName = loginUser.managementDashboardName; // 관리 페이지 이름

  // WebSocket 클라이언트 초기화
  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`),
      debug: (str) => console.log(str),
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  return (
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
            roomType="SUPPORT" // SUPPORT 타입 채팅방 조회
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
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
