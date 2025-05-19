package com.example.backend.notification.strategy;

import com.example.backend.notification.strategy.context.NewChatContext;
import com.example.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class NewChatStrategy implements NotificationStrategy {
    UserService userService;

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewChatContext)) {
            throw new IllegalArgumentException("Invalid context for NewChat Strategy");
        }
        NewChatContext ctx = (NewChatContext) context;
        return ctx.getSenderRole() + " " +  ctx.getSenderName() + "으로부터 새로운 채팅이 도착했습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
