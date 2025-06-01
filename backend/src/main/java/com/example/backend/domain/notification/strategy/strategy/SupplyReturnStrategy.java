package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.SupplyReturnContext;

public class SupplyReturnStrategy implements NotificationStrategy{

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof SupplyReturnContext)) {
            throw new IllegalArgumentException("Invalid context for SupplyReturnStrategy");
        }
        SupplyReturnContext supplyContext = (SupplyReturnContext) context;
        String statusMessage = switch (supplyContext.getReturnStatus()) {
            case DAMAGED -> "❌ 파손: ";
            case LOST -> "❗ 분실: ";
            default -> "📦 ";
        };

        return statusMessage + supplyContext.getRequesterName() + "님이 " +
                supplyContext.getItemName() + " " + supplyContext.getRequestQuantity() + "개를 반납 요청했습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        // 비품 요청은 항상 알림을 보냄
        return context instanceof SupplyReturnContext;
    }
}

