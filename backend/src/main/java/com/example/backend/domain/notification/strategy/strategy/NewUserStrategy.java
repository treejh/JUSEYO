package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NewUserContext;

public class NewUserStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof NewUserContext)) {
            throw new IllegalArgumentException("Invalid context for NewUser Strategy");
        }
        NewUserContext ctx = (NewUserContext) context;
        return ctx.getRequesterName() +"님으로부터 회원가입 승인이 요청되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        return true;
    }
}
