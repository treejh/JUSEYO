package com.example.backend.notification.strategy;

import com.example.backend.notification.strategy.context.SupplyRequestApprovalContext;

public class SupplyRequestApprovedStrategy implements NotificationStrategy {

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof SupplyRequestApprovalContext)) {
            throw new IllegalArgumentException("Invalid context for StockShortageStrategy");
        }
        SupplyRequestApprovalContext ctx = (SupplyRequestApprovalContext) context;
        // context에서 아이템 이름과 재고 수량을 추출하여 메시지 생성
        return "✅ 요청 승인됨: " + ctx.getItemName() + " " +ctx.getItemQuantity() + "개에 대한 요청이 승인되었습니다.";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        // 항상 발송 – 승인되었다는 사실 자체가 조건임
        return true;
    }
}
