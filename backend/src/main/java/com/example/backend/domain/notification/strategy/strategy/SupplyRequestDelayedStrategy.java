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
            throw new IllegalArgumentException("Invalid context for StockShortageStrategy");
        }
        SupplyRequestDelayedContext ctx = (SupplyRequestDelayedContext) context;

        return "요청하신 " + ctx.getItemName() + "의 승인이 지연되고 있습니다.(1일 전)";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof SupplyRequestDelayedContext)) {
            return false;
        }

        SupplyRequestDelayedContext requestContext = (SupplyRequestDelayedContext) context;

        // 1. 승인되지 않았고
        if (requestContext.getApprovalStatus() == ApprovalStatus.APPROVED) {
            return false;
        }

        // 2. 요청 후 24시간 경과
        boolean isDelayed = Duration.between(
                requestContext.getCreatedAt(),
                LocalDateTime.now()
        ).toHours() >= 24;

        // 3. 사용 예정일 기준 이틀 전
        boolean isTwoDaysBeforeUsage = LocalDateTime.now()
                .isEqual(requestContext.getUsageDate().minusDays(1));

        return isDelayed && isTwoDaysBeforeUsage;
    }
}
