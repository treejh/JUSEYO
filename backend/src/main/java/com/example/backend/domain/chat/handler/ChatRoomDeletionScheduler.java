package com.example.backend.domain.chat.handler;

import com.example.backend.domain.chat.chatUser.repository.ChatUserRepository;
import com.example.backend.domain.chat.chatroom.entity.ChatRoom;
import com.example.backend.domain.chat.chatroom.repository.ChatRoomRepository;
import com.example.backend.global.redis.RedisService;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class ChatRoomDeletionScheduler {

    private final RedisService redisService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatUserRepository chatUserRepository;

    @Scheduled(fixedRate = 600000) // 1분마다
    public void deleteExpiredChatRooms() {
        Set<String> roomIds = redisService.getDeletionRoomIds();

        log.info("삭제 예약 대상 채팅방 ID 목록: {}", roomIds);

        for (String idStr : roomIds) {
            Long roomId = Long.valueOf(idStr);
            String key = "chatroom:deletion:" + roomId;
            Long ttl = redisService.getExpireSeconds(key);

            log.info("채팅방 ID {}, 만료키 TTL: {}", roomId, ttl);

            if (ttl == null || ttl <= 0) {
                ChatRoom chatRoom = chatRoomRepository.findById(roomId).orElse(null);

                if (chatRoom != null) {
                    boolean isEmptyUsers = chatUserRepository.findByChatRoom(chatRoom).isEmpty();
                    log.info("채팅방 ID {} 채팅 유저 존재 여부: {}", roomId, !isEmptyUsers);

                    if (isEmptyUsers) {
                        try {
                            chatRoomRepository.delete(chatRoom);
                            log.info("🗑️ 채팅방 {} 삭제 완료", roomId);
                        } catch (Exception e) {
                            log.error("채팅방 {} 삭제 실패", roomId, e);
                        }
                    } else {
                        log.info("채팅방 {}에 사용자가 있어 삭제하지 않음", roomId);
                    }
                } else {
                    log.info("채팅방 ID {}를 DB에서 찾을 수 없음", roomId);
                }

                redisService.removeRoomIdFromDeletionList(roomId);
                log.info("채팅방 ID {} 삭제 예약 목록에서 제거", roomId);
            }
        }

    }

}
