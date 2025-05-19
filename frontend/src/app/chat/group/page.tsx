"use client";

import React, { useEffect, useState } from "react";
import ChatRoomList from "@/components/chat/ChatRoomList";
import Chat from "@/components/chat/Chat";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface User {
  id: number;
  name: string;
  department: string;
}

const ChatPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [client, setClient] = useState<Client | null>(null); // WebSocket 클라이언트 상태
  const { loginUser } = useGlobalLoginUser(); // 현재 로그인한 유저 정보
  const managementDashboardName = loginUser.managementDashboardName; // 관리 페이지 이름

  const [users, setUsers] = useState<User[]>([]); // 유저 리스트
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]); // 선택된 유저 ID 리스트
  const [chatName, setChatName] = useState<string>(""); // 채팅방 이름
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // 유저 리스트 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/chat/list?managementDashboardName=${managementDashboardName}&page=1&size=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("유저 리스트를 가져오는 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        setUsers(data.data.content); // 유저 리스트 데이터
        setLoading(false);
      } catch (err) {
        setError("유저 리스트를 가져오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [managementDashboardName]);

  // 유저 선택 토글
  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // 이미 선택된 경우 제거
          : [...prev, userId] // 선택되지 않은 경우 추가
    );
  };

  // 채팅방 생성
  const createChatRoom = async () => {
    if (!chatName.trim()) {
      alert("채팅방 이름을 입력하세요.");
      return;
    }

    if (selectedUserIds.length === 0) {
      alert("유저를 선택하세요.");
      return;
    }

    console.log("채팅방 이름:", chatName); // 디버깅용 로그
    console.log("선택된 유저 ID 리스트:", selectedUserIds); // 디버깅용 로그

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userIds: selectedUserIds, // 선택된 유저 ID 리스트
            roomName: chatName, // 유저가 입력한 채팅방 이름
            roomType: "GROUP", // 채팅방 유형 고정
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("서버 응답 오류:", errorText); // 서버 응답 확인
        throw new Error("채팅방 생성 중 오류가 발생했습니다.");
      }

      alert("채팅방이 생성되었습니다.");
      setChatName(""); // 채팅방 이름 초기화
      setSelectedUserIds([]); // 선택된 유저 초기화
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">채팅 시스템</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* 왼쪽: 유저 리스트 */}
        <div className="border-r p-4">
          <h2 className="text-xl font-bold mb-4">유저 리스트</h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="flex flex-col border p-2 rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="mr-2"
                  />
                  <span className="font-medium">{user.name}</span>
                </div>
                <span className="text-sm text-gray-500">{user.department}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="채팅방 이름 입력"
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={createChatRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              채팅방 생성
            </button>
          </div>
        </div>

        {/* 중앙: 채팅방 리스트 */}
        <div>
          <ChatRoomList
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)} // 선택된 채팅방 ID 설정
            client={client} // WebSocket 클라이언트 전달
            loginUserId={loginUser.id} // 로그인 유저 ID 전달
            roomType="GROUP" // GROUP 타입 채팅방 조회
          />
        </div>

        {/* 오른쪽: 채팅 화면 */}
        <div>
          {selectedRoomId ? (
            <Chat
              roomId={selectedRoomId}
              client={client}
              loginUserId={loginUser.id}
            />
          ) : (
            <p>채팅방을 선택하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
