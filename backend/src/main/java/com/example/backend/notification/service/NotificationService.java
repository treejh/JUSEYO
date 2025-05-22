package com.example.backend.notification.service;

import com.example.backend.exception.BusinessLogicException;
import com.example.backend.exception.ExceptionCode;
import com.example.backend.notification.dto.NotificationDTO;
import com.example.backend.notification.dto.NotificationPageResponseDTO;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.dto.NotificationResponseDTO;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.repository.NotificationRepository;
import com.example.backend.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.notification.sse.EmitterRepository;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmitterRepository emitterRepository;
    private final NotificationStrategyFactory strategyFactory;

    @Transactional
    public Notification createNotification(NotificationRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        String finalMessage = request.getMessage();

        Notification notification = Notification.builder()
                .notificationType(request.getNotificationType())
                .message(finalMessage)
                .readStatus(false)
                .user(user)
                .build();

        Notification saved = notificationRepository.save(notification);

        // SSE로 전송할 때 DTO 사용
        SseEmitter emitter = emitterRepository.get(user.getId());
        if (emitter != null) {
            try {
                emitter.send(NotificationDTO.from(saved));
            } catch (IOException e) {
                emitterRepository.delete(user.getId());
                emitter.completeWithError(e);
            }
        }

        return saved;
    }

    public NotificationPageResponseDTO getNotifications(
            Long userId,
            NotificationType type,
            Boolean unreadOnly,
            Pageable pageable
    ) {
        Page<Notification> notifications;

        if (type == null && unreadOnly == null) {
            notifications = notificationRepository.findByUserId(userId, pageable);
        } else if (type != null && unreadOnly == null) {
            notifications = notificationRepository.findByUserIdAndNotificationType(userId, type, pageable);
        } else if (type == null && unreadOnly != null) {
            notifications = notificationRepository.findByUserIdAndReadStatus(userId, unreadOnly, pageable);
        } else {
            notifications = notificationRepository.findByUserIdAndNotificationTypeAndReadStatus(
                    userId,
                    type,
                    unreadOnly,
                    pageable
            );
        }

        return NotificationPageResponseDTO.from(notifications);
    }


    @Transactional
    public SseEmitter streamNotifications(Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L);
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

        // 안 읽은 알림도 DTO로 변환하여 전송
        List<Notification> unread = notificationRepository.findByUserAndReadStatus(user, false);
        for (Notification notification : unread) {
            emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(NotificationDTO.from(notification)));
        }

        return emitter;
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));
        return notificationRepository.findByUser(user);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setReadStatus(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAsReadAllByUser(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        for (Notification notification : notifications) {
            notification.setReadStatus(true);
        }
        notificationRepository.saveAll(notifications);
    }


}
