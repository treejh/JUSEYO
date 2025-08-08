package com.example.backend.domain.chat.chatMessage.repository;

import com.example.backend.domain.chat.chatMessage.entity.ChatMessage;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // 채팅방 ID로 삭제
    void deleteAllByChatRoomId(Long chatRoomId);

    // 채팅방 ID로 페이징 조회
    Page<ChatMessage> findByChatRoomId(Long chatRoomId, Pageable pageable);

    // 채팅방 ID 기준으로 최신 메시지 조회
    Optional<ChatMessage> findTopByChatRoomIdOrderByCreatedAtDesc(Long chatRoomId);
}
