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
    <div className="h-[95vh] flex flex-col p-4">
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
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">1:1 대화를 시작해보세요!</h3>
              <p className="text-gray-500 max-w-sm">
                왼쪽에서 대화하고 싶은 상대를 선택하거나,<br />
                기존 채팅방에 입장하여 대화를 이어가보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
