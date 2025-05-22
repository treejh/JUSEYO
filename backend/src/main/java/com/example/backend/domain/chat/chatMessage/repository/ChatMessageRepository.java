package com.example.backend.domain.chat.chatMessage.repository;

import com.example.backend.domain.chat.chatMessage.entity.ChatMessage;
import com.example.backend.domain.chat.chatroom.entity.ChatRoom;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방에 해당하는 모든 메시지 삭제
    void deleteAllByChatRoom(ChatRoom chatRoom);

    Page<ChatMessage> findByChatRoom(ChatRoom chatRoom, Pageable pageable);
    Optional<ChatMessage> findTopByChatRoomOrderByCreatedAtDesc(ChatRoom chatRoom);

}
