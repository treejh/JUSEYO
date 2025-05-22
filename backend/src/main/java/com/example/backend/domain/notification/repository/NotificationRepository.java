package com.example.backend.domain.notification.repository;

import com.example.backend.domain.notification.entity.Notification;
import com.example.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser(User user);
    // 특정 유저의 읽지 않은 알림 목록 조회
    List<Notification> findByUserAndReadStatus(User user, boolean readStatus);
    List<Notification> findByUserId(Long userId);
}
