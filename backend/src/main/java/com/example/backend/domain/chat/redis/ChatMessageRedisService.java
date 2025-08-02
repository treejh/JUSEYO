package com.example.backend.domain.chat.redis;

import com.example.backend.domain.chat.chatMessage.dto.response.ChatResponseDto;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageRedisService {


    private final RedisTemplate<String, Object> chatMessageRedisTemplate;
    private final RedissonClient redissonClient;

    @Getter
    @Value("${redis-custom.chat-message-TTL}")
    public int messageTTL;



    public List<ChatResponseDto> getCachedMessages(Long roomId, int page) {
        String key = getMessageCacheKey(roomId, page);
        List<Object> cached = chatMessageRedisTemplate.opsForList().range(key, 0, -1);
        if (cached == null || cached.isEmpty()) return null;
        return cached.stream().map(obj -> (ChatResponseDto) obj).toList();
    }


    public void cacheMessages(Long roomId, List<ChatResponseDto> messages, Duration ttl, int page) {
        String key = getMessageCacheKey(roomId, page);
        chatMessageRedisTemplate.delete(key);
        if (messages == null || messages.isEmpty()) {
            chatMessageRedisTemplate.opsForList().rightPush(key, "__empty__");
            chatMessageRedisTemplate.expire(key, ttl);
            log.warn("📭 캐시 저장 시 빈 메시지 리스트 - 저장 생략 (roomId: {}, page: {})", roomId, page);
            return;
        }

        String key = getMessageCacheKey(roomId, page);

        // 기존 데이터 제거 후 새로 삽입
        chatMessageRedisTemplate.delete(key);
        chatMessageRedisTemplate.opsForList().rightPushAll(key, new ArrayList<>(messages));
        chatMessageRedisTemplate.expire(key, ttl);
    }



    public RLock getMessageLock(Long roomId) {
        return redissonClient.getLock("lock:chatroom:" + roomId + ":page:0");
    }

    public String getMessageCacheKey(Long roomId, int page) {
        return "chatroom:" + roomId + ":messages:page:" + page;
    }


}
