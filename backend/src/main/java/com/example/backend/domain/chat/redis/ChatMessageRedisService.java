package com.example.backend.domain.chat.redis;

import com.example.backend.domain.chat.chatMessage.dto.response.ChatResponseDto;
import java.time.Duration;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedissonClient redissonClient;

    @Getter
    @Value("${redis-custom.chat-message-TTL}")
    public int messageTTL=1000;


    public String getMessageCacheKey(Long roomId) {
        return "chatroom:" + roomId + ":messages:page:0";
    }

    public List<ChatResponseDto> getCachedMessages(Long roomId) {
        String key = getMessageCacheKey(roomId);
        List<Object> cached = redisTemplate.opsForList().range(key, 0, -1);
        if (cached == null || cached.isEmpty()) return null;
        return cached.stream().map(obj -> (ChatResponseDto) obj).toList();
    }

    public void cacheMessages(Long roomId, List<ChatResponseDto> messages, Duration ttl) {
        String key = getMessageCacheKey(roomId);
        redisTemplate.delete(key); // 기존 제거
        redisTemplate.opsForList().rightPushAll(key, messages.toArray());
        redisTemplate.expire(key, ttl);
    }

    public RLock getMessageLock(Long roomId) {
        return redissonClient.getLock("lock:chatroom:" + roomId + ":page:0");
    }

}
