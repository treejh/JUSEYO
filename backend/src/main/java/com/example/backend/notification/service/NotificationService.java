package com.example.backend.notification.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.repository.NotificationRepository;
import com.example.backend.notification.service.strategy.NotificationStrategyFactory;
import com.example.backend.notification.sse.EmitterRepository;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmitterRepository emitterRepository;
    private final NotificationStrategyFactory strategyFactory; // ✅ 추가

    public Notification createNotification(NotificationRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        NotificationStrategy strategy = strategyFactory.getStrategy(request.getNotificationType());

        String finalMessage = strategy.generateMessage(request.getMessage());


        Notification notification = Notification.builder()
                .notificationType(request.getNotificationType())
                .message(finalMessage)
                .readStatus(false)
                .user(user)
                .build();

        Notification saved = notificationRepository.save(notification);

        // 알림이 생성되면 즉시 SSE로 푸시
        SseEmitter emitter = emitterRepository.get(user.getId());
        if (emitter != null) {
            try {
                emitter.send(saved);  // 알림 전송
            } catch (IOException e) {
                emitterRepository.delete(user.getId());  // 오류 발생 시 emitter 제거
                emitter.completeWithError(e);
            }
        }

        return saved;
    }

    public SseEmitter streamNotifications(Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1시간 타임아웃
        emitterRepository.save(userId, emitter);

        emitter.onCompletion(() -> emitterRepository.delete(userId));
        emitter.onTimeout(() -> emitterRepository.delete(userId));
        emitter.onError((e) -> emitterRepository.delete(userId));

        // 연결 확인용 더미 이벤트
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("SSE 연결 완료"));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }

        // ⬇️ 안 읽은 알림도 같이 보내기
        List<Notification> unread = notificationRepository.findByUserAndReadStatus(user, false);
        for (Notification notification : unread) {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(notification));
        }

        return emitter;
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        return notificationRepository.findByUser(user);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }
}
