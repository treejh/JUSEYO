package com.example.backend.domain.notification.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewChatNotificationDTO {
    private Long targetUserId;
    private Long roomId;
    private Long senderId;
}
