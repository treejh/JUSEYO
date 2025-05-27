package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class ReturnDueSoonStrategy implements NotificationStrategy {

    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof ReturnDueDateContext)) {
            throw new IllegalArgumentException("Invalid context type");
        }

        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        if (ctx.getReturnDate() == null) return false;

        long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), ctx.getReturnDate());
        return daysLeft == 1; // 반납 하루 전
    }

    @Override
    public String generateMessage(Object context) {
        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        return "⏰ [" + ctx.getItemName() + "]의 반납일이 하루 남았습니다. 제때 반납해주세요!";
    }
}
