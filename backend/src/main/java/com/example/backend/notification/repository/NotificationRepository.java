package com.example.backend.notification.repository;

import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser(User user);
    // 특정 유저의 읽지 않은 알림 목록 조회
    List<Notification> findByUserAndReadStatus(User user, boolean readStatus);
    List<Notification> findByUserId(Long userId);
    void deleteByCreatedAtBeforeAndReadStatusTrue(LocalDateTime cutoff);
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    Page<Notification> findByUserIdAndNotificationType(Long userId, NotificationType type, Pageable pageable);
    Page<Notification> findByUserIdAndReadStatus(Long userId, boolean readStatus, Pageable pageable);

    Page<Notification> findByUserIdAndNotificationTypeAndReadStatus(
            Long userId,
            NotificationType type,
            boolean readStatus,
            Pageable pageable
    );
    Page<Notification> findByUserIdAndNotificationTypeIn(
            Long userId,
            Set<NotificationType> types,
            Pageable pageable
    );

    Page<Notification> findByUserIdAndReadStatusAndNotificationTypeIn(
            Long userId,
            Boolean readStatus,
            Set<NotificationType> types,
            Pageable pageable
    );

    void deleteByUserIdAndReadStatusTrue(Long userId);


}
