package com.example.backend.notification.dto;

import com.example.backend.notification.entity.Notification;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
public class NotificationPageResponseDTO {
    private List<NotificationResponseDTO> notifications;
    private long totalElements;
    private int totalPages;

    public static NotificationPageResponseDTO from(Page<Notification> page) {
        List<NotificationResponseDTO> dtoList = page.map(NotificationResponseDTO::from).getContent();
        return NotificationPageResponseDTO.builder()
                .notifications(dtoList)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
