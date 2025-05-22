package com.example.backend.notification.dto;

import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponseDTO {

    private Long id;
    private NotificationType type;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;

    public static NotificationResponseDTO from(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .type(notification.getNotificationType())
                .message(notification.getMessage())
                .readStatus(notification.isReadStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
