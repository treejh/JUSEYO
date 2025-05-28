"use client";

import React, { useEffect, useState } from "react";
import ChatRoomList from "@/components/chat/ChatRoomList";
import Chat from "@/components/chat/Chat";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

const SupportChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [client, setClient] = useState<Client | null>(null); // WebSocket 클라이언트 상태
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보
  const toast = useCustomToast();

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

  // 고객센터 채팅방 존재 여부 확인
  const checkSupportChatRoomExistence = async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/exist/support`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "고객센터 채팅방 존재 여부 확인 중 오류가 발생했습니다."
        );
      }

      const data = await response.json();
      return data.data; // true 또는 false 반환
    } catch (error) {
      console.error("고객센터 채팅방 존재 여부 확인 실패:", error);
      return false; // 오류 발생 시 기본값으로 false 반환
    }
  };

  // 고객센터 채팅방 생성
  const createSupportChatRoom = async () => {
    try {
      const exists = await checkSupportChatRoomExistence(); // 채팅방 존재 여부 확인
      if (exists) {
        toast.error("이미 고객센터 채팅방이 존재합니다.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            roomType: "SUPPORT", // 고객센터 채팅방 유형
          }),
        }
      );

      if (!response.ok) {
        throw new Error("고객센터 채팅방 생성 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      toast.success("고객센터 채팅방이 생성되었습니다.");
      window.location.reload(); // 페이지 새로고침
      console.log("생성된 채팅방:", data.data);
    } catch (error) {
      console.error("고객센터 채팅방 생성 실패:", error);
      toast.error("고객센터 채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <div className="p-4 h-screen flex flex-col">
      {/* 버튼 영역 */}
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={createSupportChatRoom}
        >
          고객센터 채팅 생성
        </button>
      </div>

      {/* 채팅방 리스트와 채팅창 */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* 채팅방 리스트 */}
        <div className="col-span-1">
          <ChatRoomList
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)} // 선택된 채팅방 ID 설정
            client={client}
            loginUserId={loginUser.id} // 현재 로그인한 유저 ID 전달
            roomType="SUPPORT" // SUPPORT 타입 채팅방 조회
          />
        </div>

        {/* 채팅창 */}
        <div className="col-span-2 flex-1 bg-white p-4 rounded-lg shadow-md overflow-hidden">
          {selectedRoomId ? (
            <Chat
              roomId={selectedRoomId}
              client={client}
              loginUserId={loginUser.id}
              onClose={() => setSelectedRoomId(null)}
            />
          ) : (
            <p className="text-gray-500">채팅방을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportChatPage;
