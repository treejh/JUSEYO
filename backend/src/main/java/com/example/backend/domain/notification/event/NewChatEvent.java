package com.example.backend.domain.notification.event;

import com.example.backend.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NewChatEvent {
    private Long targetId;
    private Long roomId;
    private RoleType senderRole;
    private String senderName;
}
