import React, { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const createChatRoom = async (userId: number) => {
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
            userId, // 선택된 유저 ID
            roomName: "1:1 채팅방", // 채팅방 이름
            roomType: "ONE_TO_ONE", // 채팅방 유형
          }),
        }
      );

      if (!response.ok) {
        throw new Error("채팅방 생성 중 오류가 발생했습니다.");
      }

      alert("채팅방이 성공적으로 생성되었습니다!");
    } catch (err) {
      alert("채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">유저 리스트</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-600">부서: {user.department}</p>
            </div>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => createChatRoom(user.id)} // 채팅방 생성 요청
            >
              채팅방 생성
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
