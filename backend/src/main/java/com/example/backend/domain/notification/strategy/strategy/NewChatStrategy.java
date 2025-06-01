package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewChatContext;
import com.example.backend.domain.user.service.UserService;
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

        String message = ctx.getSenderRole() + " " + ctx.getSenderName() + "님이 ";

        switch (ctx.getChatRoomType()) {
            case ONE_TO_ONE:
                message += "1:1 채팅방에 초대하셨습니다.";
                break;
            case GROUP:
                message += "그룹 채팅방에 초대하셨습니다.";
                break;
            case SUPPORT:
                message += "고객지원을 요청하셨습니다.";
                break;
            default:
                message += "채팅방에 초대하셨습니다."; // 기본 메시지
        }

        return message;
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
