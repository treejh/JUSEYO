package com.example.backend.chat.chatMessage.repository;

import com.example.backend.chat.chatMessage.entity.ChatMessage;
import com.example.backend.chat.chatroom.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방에 해당하는 모든 메시지 삭제
    void deleteAllByChatRoom(ChatRoom chatRoom);
}
