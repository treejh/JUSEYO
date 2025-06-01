package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.SupplyRequestDelayedContext;
import com.example.backend.enums.ApprovalStatus;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SupplyRequestDelayedStrategy implements NotificationStrategy {

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof SupplyRequestDelayedContext)) {
            throw new IllegalArgumentException("Invalid context for SupplyRequestDelayedStrategy");
        }
        SupplyRequestDelayedContext ctx = (SupplyRequestDelayedContext) context;

        return "⚠️ 요청하신 " + ctx.getItemName() + "의 승인이 지연되고 있습니다(사용 1일 전).";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof SupplyRequestDelayedContext)) {
            return false;
        }

        SupplyRequestDelayedContext ctx = (SupplyRequestDelayedContext) context;

        // 1. 승인되지 않은 요청만
        if (ctx.getApprovalStatus() == ApprovalStatus.APPROVED) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = ctx.getCreatedAt();
        LocalDate usageDate = ctx.getUsageDate().toLocalDate(); // LocalDateTime -> LocalDate

        // 2. 요청 생성 24시간 후부터
        boolean isAfter24Hours = now.isAfter(createdAt.plusHours(24));

        // 3. 사용 예정일 하루 전까지 (즉, now 날짜가 사용 예정일 -1일과 같으면 true)
        boolean isBeforeUsageDay = now.toLocalDate().isBefore(usageDate);

        return isAfter24Hours && isBeforeUsageDay;
    }
}
