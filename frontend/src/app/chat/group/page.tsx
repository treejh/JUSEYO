"use client";

import React, { useEffect, useState } from "react";
import ChatRoomList from "@/components/chat/ChatRoomList";
import Chat from "@/components/chat/Chat";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useCustomToast } from "@/utils/toast";

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
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]); // 선택된 유저 정보
  const [searchQuery, setSearchQuery] = useState<string>(""); // 검색 쿼리
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

  // 모달 열기
  const openModal = () => {
    const selected = users.filter((user) => selectedUserIds.includes(user.id));
    setSelectedUsers(selected); // 선택된 유저 정보 설정
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setChatName(""); // 채팅방 이름 초기화
  };

  // 채팅방 생성
  const createChatRoom = async () => {
    if (!chatName.trim()) {
      toast.warning("채팅방 이름을 입력하세요.");
      return;
    }

    if (selectedUserIds.length === 0) {
      toast.warning("유저를 선택하세요.");
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

      toast.success("채팅방이 생성되었습니다.");
      setChatName(""); // 채팅방 이름 초기화
      setSelectedUserIds([]); // 선택된 유저 초기화
      closeModal(); // 모달 닫기
      window.location.reload(); // 페이지 새로고침
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      toast.error("채팅방 생성에 실패했습니다.");
    }
  };

  // 검색 쿼리에 따른 필터링된 유저 리스트
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
        <p className="text-lg text-gray-600">채팅 서비스를 준비하는 중...</p>
      </div>
    </div>
  );
  if (error) return <p>{error}</p>;

  return (
    <div className="h-[95vh] flex flex-col p-4">
      <div className="flex flex-1 gap-4">
        {/* 왼쪽: 유저 리스트 */}
        <div className="w-1/6 bg-white p-4 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-bold mb-4 text-gray-700">유저 리스트</h2>
          {/* 채팅방 생성 버튼 */}
          <div className="mb-4">
            <button
              onClick={openModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
            >
              채팅방 생성
            </button>
          </div>
          {/* 이름 검색 입력 필드 */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름으로 검색"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* 유저 리스트 */}
          <ul className="space-y-4 max-h-[730px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between bg-white shadow-sm p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="mr-3 accent-blue-500"
                  />
                  <div>
                    <p
                      className="font-medium text-gray-800 truncate max-w-[120px]"
                      title={user.name}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-sm text-gray-500 truncate max-w-[120px]"
                      title={user.department}
                    >
                      {user.department}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 중앙: 채팅방 리스트 */}
        <div className="w-1/5">
          <ChatRoomList
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)} // 선택된 채팅방 ID 설정
            client={client} // WebSocket 클라이언트 전달
            loginUserId={loginUser.id} // 로그인 유저 ID 전달
            roomType="GROUP" // GROUP 타입 채팅방 조회
          />
        </div>

        {/* 오른쪽: 채팅 화면 */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow-md overflow-hidden">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">채팅을 시작해보세요!</h3>
              <p className="text-gray-500 max-w-sm">
                왼쪽의 채팅방 목록에서 참여할 채팅방을 선택하거나,<br />
                새로운 채팅방을 만들어 대화를 시작할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
            {/* 닫기 버튼 */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              aria-label="닫기"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center tracking-tight">
              그룹 채팅방 생성
            </h2>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-600 mb-2">
                선택된 유저
              </h3>
              <ul className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <li
                    key={user.id}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
                    title={`${user.name} (${user.department})`}
                  >
                    <span className="font-medium">{user.name}</span>
                    <span className="ml-1 text-xs text-blue-500">
                      ({user.department})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="채팅방 이름을 입력하세요"
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={createChatRoom}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
