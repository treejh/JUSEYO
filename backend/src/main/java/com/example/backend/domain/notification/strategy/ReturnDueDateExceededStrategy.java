package com.example.backend.domain.notification.strategy;

import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;

import java.time.LocalDateTime;

public class ReturnDueDateExceededStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        return "📦 반납 기한 초과: " + ctx.getItemName() + "의 반납일(" + ctx.getReturnDate() + ")이 지났습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        return ctx.getReturnDate() != null && ctx.getReturnDate().isBefore(LocalDateTime.now());
    }
}
