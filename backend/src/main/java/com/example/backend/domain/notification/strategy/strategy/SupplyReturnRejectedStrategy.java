package com.example.backend.domain.notification.strategy.strategy;

import com.example.backend.domain.notification.strategy.context.SupplyReturnApprovalContext;

public class SupplyReturnRejectedStrategy implements NotificationStrategy {
    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof SupplyReturnApprovalContext)) {
            throw new IllegalArgumentException("Invalid context for SupplyReturnRejectedStrategy");
        }
        SupplyReturnApprovalContext ctx = (SupplyReturnApprovalContext) context;
        // context에서 아이템 이름과 재고 수량을 추출하여 메시지 생성
        return ctx.getItemName() + " " +ctx.getItemQuantity() + "개에 대한 반납 요청이 거부되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        // 항상 발송 – 승인되었다는 사실 자체가 조건임
        return true;
    }
}