package com.example.backend.notification.strategy.context;

import com.example.backend.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class NewChatContext {
    private Long targetId;
    private Long roomId;
    RoleType senderRole;
    String senderName;
}
