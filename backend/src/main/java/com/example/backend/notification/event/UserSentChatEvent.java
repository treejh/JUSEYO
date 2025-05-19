package com.example.backend.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSentChatEvent {
    private String userName;
}
