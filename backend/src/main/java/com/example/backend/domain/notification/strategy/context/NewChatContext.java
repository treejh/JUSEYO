package com.example.backend.domain.notification.strategy.context;

import com.example.backend.enums.ChatRoomType;
import com.example.backend.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class NewChatContext {
    private Long targetId;
    private Long roomId;
    private RoleType senderRole;
    private String senderName;
    private ChatRoomType chatRoomType;
}
