package com.example.backend.redis;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    // 저장
    public void saveData(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }



    // 저장 + 만료 시간 설정
    public void saveData(String key, String value, Duration timeout) {
        redisTemplate.opsForValue().set(key, value, timeout);
    }
    // 조회
    public String getData(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // 삭제
    public void deleteData(String key) {
        redisTemplate.delete(key);
    }

    // 삭제 예약 리스트에 추가
    public void addRoomIdToDeletionList(Long roomId) {
        redisTemplate.opsForSet().add("chatroom:deletion:list", String.valueOf(roomId));
    }

    // 삭제 예약 리스트 가져오기
    public Set<String> getDeletionRoomIds() {
        return redisTemplate.opsForSet().members("chatroom:deletion:list");
    }

    // 삭제 예약 리스트에서 제거
    public void removeRoomIdFromDeletionList(Long roomId) {
        redisTemplate.opsForSet().remove("chatroom:deletion:list", String.valueOf(roomId));
    }

    // TTL 조회 (초 단위)
    public Long getExpireSeconds(String key) {
        return redisTemplate.getExpire(key, TimeUnit.SECONDS);
    }

    // 특정 패턴의 키 모두 조회
    public Set<String> getKeys(String pattern) {
        return redisTemplate.keys(pattern);
    }


    //redis에 키가 존재하는지 확인
    public boolean checkExistsKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

}
