package com.example.backend.notification.strategy;

import com.example.backend.notification.strategy.context.ReturnDueSoonContext;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class ReturnDueSoonStrategy implements NotificationStrategy {

    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof ReturnDueSoonContext)) {
            throw new IllegalArgumentException("Invalid context type");
        }

        ReturnDueSoonContext ctx = (ReturnDueSoonContext) context;
        if (ctx.getReturnDate() == null) return false;

        long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), ctx.getReturnDate());
        return daysLeft == 1; // 반납 하루 전
    }

    @Override
    public String generateMessage(Object context) {
        ReturnDueSoonContext ctx = (ReturnDueSoonContext) context;
        return "⏰ [" + ctx.getProductName() + "]의 반납일이 하루 남았습니다. 제때 반납해주세요!";
    }
}
