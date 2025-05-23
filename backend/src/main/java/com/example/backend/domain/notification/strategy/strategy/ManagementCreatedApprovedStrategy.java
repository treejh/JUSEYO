package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewChatContext;
import com.example.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ManagementCreatedApprovedStrategy implements NotificationStrategy {
    UserService userService;

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewChatContext)) {
            throw new IllegalArgumentException("Invalid context for NewChat Strategy");
        }
        NewChatContext ctx = (NewChatContext) context;
        return ctx.getSenderRole() + " " +  ctx.getSenderName() + "님이 새로운 채팅방에 초대하셨습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}

