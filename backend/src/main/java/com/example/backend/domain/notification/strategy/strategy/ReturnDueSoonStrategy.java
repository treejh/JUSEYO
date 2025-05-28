package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class ReturnDueSoonStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        LocalDate today = LocalDate.now();
        LocalDate returnDate = ctx.getReturnDate().toLocalDate();

        long daysLeft = ChronoUnit.DAYS.between(today, returnDate);

        if (daysLeft == 1) {
            return "⏰ [" + ctx.getItemName() + "]의 반납일이 내일입니다. 잊지 말고 꼭 반납해주세요!";
        } else {
            return "⚠️ [" + ctx.getItemName() + "]의 반납일이 오늘입니다! 꼭 반납해 주세요!";
        }
    }
    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof ReturnDueDateContext)) {
            throw new IllegalArgumentException("Invalid context type");
        }

        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        if (ctx.getReturnDate() == null) return false;

        LocalDate today = LocalDate.now();
        LocalDate returnDate = ctx.getReturnDate().toLocalDate();

        long daysLeft = ChronoUnit.DAYS.between(today, returnDate);

        // 반납일 하루 전(1) 또는 당일(0)일 때 알림
        return daysLeft == 1 || daysLeft == 0;
    }

}
