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
    <div className="p-4 h-screen flex flex-col">
      <div className="flex flex-1 gap-4">
        {/* 유저 리스트 */}
        <div className="w-1/5">
          <UserList
            onSelectUser={(userId) => console.log(`유저 ${userId} 선택됨`)}
            managementDashboardName={managementDashboardName || ""}
          />
        </div>

        {/* 채팅방 리스트 */}
        <div className="w-1/5">
          <ChatRoomList
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)} // 선택된 채팅방 ID 설정
            client={client} // WebSocket 클라이언트 전달
            loginUserId={loginUser.id} // 로그인 유저 ID 전달
            roomType="ONE_TO_ONE" // SUPPORT 타입 채팅방 조회
          />
        </div>

        {/* 채팅창 */}
        <div className="col-span-2 flex-1 bg-white p-4 rounded-lg shadow-md">
          {selectedRoomId ? (
            <Chat
              roomId={selectedRoomId}
              client={client}
              loginUserId={loginUser.id}
              onClose={() => setSelectedRoomId(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              채팅방을 선택하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
