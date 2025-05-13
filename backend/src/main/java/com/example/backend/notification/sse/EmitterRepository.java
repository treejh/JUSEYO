package com.example.backend.notification.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class EmitterRepository {
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter save(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
        return emitter;
    }

    public SseEmitter get(Long userId) {
        return emitters.get(userId);
    }

    public void delete(Long userId) {
        emitters.remove(userId);
    }
}
