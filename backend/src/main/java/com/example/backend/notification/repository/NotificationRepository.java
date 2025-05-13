package com.example.backend.notification.repository;

import com.example.backend.notification.entity.Notification;
import com.example.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUser(User user);
}
