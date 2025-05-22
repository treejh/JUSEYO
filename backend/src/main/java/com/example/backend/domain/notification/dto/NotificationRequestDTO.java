package com.example.backend.domain.notification.dto;

import com.example.backend.domain.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationRequestDTO {
    private NotificationType notificationType;
    private String message;
    private Long userId; // 알림을 받을 유저의 ID
}

