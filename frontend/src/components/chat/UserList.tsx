import React, { useEffect, useState } from "react";
import { useCustomToast } from "@/utils/toast";

interface User {
  id: number;
  name: string;
  department: string;
}

interface Props {
  onSelectUser: (userId: number) => void;
  managementDashboardName: string; // 현재 로그인한 유저의 관리 페이지 이름
}

const UserList: React.FC<Props> = ({
  onSelectUser,
  managementDashboardName,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // 검색된 유저 리스트
  const [searchQuery, setSearchQuery] = useState<string>(""); // 검색어
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // 선택된 유저 ID
  const [selectedUserName, setSelectedUserName] = useState<string>(""); // 선택된 유저 이름
  const [showCreateUI, setShowCreateUI] = useState<boolean>(false); // 채팅방 생성 UI 표시 여부
  const toast = useCustomToast();

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
        setFilteredUsers(data.data.content); // 초기 필터링된 리스트 설정
        setLoading(false);
      } catch (err) {
        setError("유저 리스트를 가져오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [managementDashboardName]);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users); // 검색어가 없으면 전체 리스트 표시
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const checkChatRoomExistence = async (userId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chats/chatRooms/exists/users?userId=${userId}&chatRoomType=ONE_TO_ONE`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("채팅방 존재 여부 확인 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      return data.data; // true: 채팅방 존재, false: 채팅방 없음
    } catch (err) {
      console.error("채팅방 존재 여부 확인 실패:", err);
      return false;
    }
  };

  const handleChatRoomCheck = async (userId: number, userName: string) => {
    const exists = await checkChatRoomExistence(userId);

    if (exists) {
      toast.error("이미 존재하는 채팅방입니다.");
      setShowCreateUI(false); // 채팅방 생성 UI 숨기기
    } else {
      setSelectedUserId(userId); // 선택된 유저 ID 설정
      setSelectedUserName(userName); // 선택된 유저 이름 설정
      setShowCreateUI(true); // 채팅방 생성 UI 표시
    }
  };

  const createChatRoom = async () => {
    if (!selectedUserId || !selectedUserName) {
      toast.error("채팅방 생성에 필요한 정보가 부족합니다.");
      return;
    }

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
            userId: selectedUserId, // 선택된 유저 ID
            roomName: selectedUserName, // 선택된 유저 이름을 채팅방 이름으로 사용
            roomType: "ONE_TO_ONE", // 채팅방 유형 고정
          }),
        }
      );

      if (!response.ok) {
        throw new Error("채팅방 생성 중 오류가 발생했습니다.");
      }

      toast.success("채팅방이 성공적으로 생성되었습니다!");
      window.location.reload(); // 새로고침
      setSelectedUserId(null); // 선택된 유저 초기화
      setSelectedUserName(""); // 선택된 유저 이름 초기화
      setShowCreateUI(false); // 채팅방 생성 UI 숨기기
    } catch (err) {
      toast.error("채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  if (loading)
    return (
      <div className="h-full bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="h-full overflow-y-auto bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">유저 리스트</h2>

      {/* 검색 입력 필드 */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 유저 리스트 감싸는 컨테이너에 max-h와 스크롤 추가 */}
      <div className="max-h-[800px] overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {[...filteredUsers]
            .sort((a, b) => a.name.localeCompare(b.name, "ko"))
            .map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 transition-colors duration-150 ease-in-out rounded-lg"
              >
                {/* 유저 정보 */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-800 mb-0.5">
                    {user.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {user.department}
                  </span>
                </div>

                {/* 버튼 영역 */}
                <div className="flex min-w-[110px] flex-shrink-0 justify-end ml-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors duration-150 ease-in-out"
                    onClick={() => handleChatRoomCheck(user.id, user.name)}
                  >
                    채팅방 생성
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* 채팅방 생성 UI */}
      {showCreateUI && (
        <div className="fixed inset-0 bg-gray-500/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center tracking-tight">
              1:1 채팅방 생성
            </h3>
            <p className="text-base font-semibold text-gray-600 mb-6">
              선택된 유저: <strong>{selectedUserName}</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateUI(false)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  await createChatRoom();
                  window.location.reload();
                }}
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

export default UserList;
