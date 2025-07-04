package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewUserContext;

public class NewUserRejectedStrategy implements NotificationStrategy{
    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewUserContext)) {
            throw new IllegalArgumentException("Invalid context for NewUserRejected Strategy");
        }
        NewUserContext ctx = (NewUserContext) context;
        return ctx.getRequesterName() +"님의 회원 가입이 거부되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
