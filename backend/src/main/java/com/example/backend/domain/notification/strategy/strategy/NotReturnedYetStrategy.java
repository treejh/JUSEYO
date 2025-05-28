package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.NotReturnedContext;
import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;
import com.example.backend.domain.notification.strategy.context.SupplyRequestDelayedContext;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.enums.ApprovalStatus;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class NotReturnedYetStrategy implements  NotificationStrategy{

    @Override
    public String generateMessage(Object context) {
        NotReturnedContext ctx = (NotReturnedContext) context;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = ctx.getReturnDate().format(formatter);
        return "📦 장기 미반납 알림: " + ctx.getItemName() + "의 반납일(" + formattedDate + ")이 지났습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof NotReturnedContext)) return false;

        NotReturnedContext ctx = (NotReturnedContext) context;

        if (ctx.getApprovalStatus() != ApprovalStatus.APPROVED){
            return false;
        }

        // 단순 날짜 비교: 반납일이 3일 이상 지났으면 알림
        long daysOverdue = ChronoUnit.DAYS.between(ctx.getReturnDate(), LocalDate.now());
        return ctx.getReturnDate() != null && daysOverdue >= 3;
    }
}
