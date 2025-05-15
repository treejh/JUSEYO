'use client";';

import React, { useState } from "react";
import ChatRoomList from "@/components/ChatRoomList";
import Chat from "@/components/Chat";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const { loginUser } = useGlobalLoginUser();

  // WebSocket 클라이언트 초기화
  React.useEffect(() => {
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <ChatRoomList
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)} // 선택된 채팅방 ID 설정
            client={client}
            loginUserId={loginUser.id}
          />
        </div>
        <div>
          {selectedRoomId ? (
            <Chat roomId={selectedRoomId} client={client} />
          ) : (
            <p>채팅방을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
