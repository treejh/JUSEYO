package com.example.backend.domain.notification.strategy;

import com.example.backend.domain.notification.strategy.context.SupplyRequestContext;

public class SupplyRequestStrategy implements NotificationStrategy {

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof SupplyRequestContext)) {
            throw new IllegalArgumentException("Invalid context for SupplyRequestStrategy");
        }
        SupplyRequestContext supplyContext = (SupplyRequestContext) context;

        return "📦 비품 요청: " + supplyContext.getRequesterName() + "님이 " +
                supplyContext.getItemName() + " " + supplyContext.getRequestQuantity() + "개을(를) 요청했습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        // 비품 요청은 항상 알림을 보냄
        return context instanceof SupplyRequestContext;
    }
}

