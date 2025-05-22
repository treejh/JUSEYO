package com.example.backend.domain.notification.service;

import com.example.backend.domain.notification.dto.NotificationDTO;
import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.Notification;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.sse.EmitterRepository;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.global.exception.BusinessLogicException;
import com.example.backend.global.exception.ExceptionCode;
import com.example.backend.domain.notification.repository.NotificationRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.repository.UserRepository;
import com.example.backend.notification.notificationPolicy.NotificationPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.example.backend.domain.notification.dto.NotificationPageResponseDTO;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessLogicException(ExceptionCode.USER_NOT_FOUND));

        Page<Notification> notifications;

        // 사용자 ROLE에 따라 필터링할 알림 타입 결정
        Set<NotificationType> allowedTypes = new HashSet<>(NotificationPolicy.getAllowedTypesByRole(user.getRole().getRole()));

        if (type != null && !allowedTypes.contains(type)) {
            throw new BusinessLogicException(ExceptionCode.NOTIFICATION_DENIED_EXCEPTION);
        }

        if (type == null && unreadOnly == null) {
            notifications = notificationRepository.findByUserIdAndNotificationTypeIn(userId, allowedTypes, pageable);
        } else if (type != null && unreadOnly == null) {
            notifications = notificationRepository.findByUserIdAndNotificationType(userId, type, pageable);
        } else if (type == null && unreadOnly != null) {
            notifications = notificationRepository.findByUserIdAndReadStatusAndNotificationTypeIn(userId, !unreadOnly, allowedTypes, pageable);
        } else {
            notifications = notificationRepository.findByUserIdAndNotificationTypeAndReadStatus(
                    userId,
                    type,
                    !unreadOnly,
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

    @Transactional
    public void deleteAllReadNotificationsByUserId(Long userId) {
        notificationRepository.deleteByUserIdAndReadStatusTrue(userId);
    }


}
