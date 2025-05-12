package com.example.backend.redis;

import java.time.Duration;
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

    //redis에 키가 존재하는지 확인
    public boolean checkExistsKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

}
