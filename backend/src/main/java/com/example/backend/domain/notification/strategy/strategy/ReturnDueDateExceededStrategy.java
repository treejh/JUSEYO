package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReturnDueDateExceededStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        ReturnDueDateContext ctx = (ReturnDueDateContext) context;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = ctx.getReturnDate().toLocalDate().format(formatter);  // 날짜만 추출
        return "📦 " + ctx.getItemName() + "의 반납일(" + formattedDate + ")이 지났습니다.";
    }


    @Override
    public boolean shouldTrigger(Object context) {
        ReturnDueDateContext ctx = (ReturnDueDateContext) context;

        if (ctx.getReturnDate() == null) return false;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime returnDate = ctx.getReturnDate();

        return returnDate.isBefore(now) &&
                returnDate.plusDays(3).isAfter(now);  // 반납일 + 3일 > 현재 시간 > 반납일
    }
}
