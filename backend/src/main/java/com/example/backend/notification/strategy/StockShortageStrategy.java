package com.example.backend.notification.strategy;

import com.example.backend.notification.strategy.context.ItemStockContext;

public class StockShortageStrategy implements NotificationStrategy {

    @Override
    public String generateMessage(Object context) {
        if (!(context instanceof ItemStockContext)) {
            throw new IllegalArgumentException("Invalid context for StockShortageStrategy");
        }
        ItemStockContext stockContext = (ItemStockContext) context;
        // context에서 아이템 이름과 재고 수량을 추출하여 메시지 생성
        return "⚠️ " + stockContext.getItemName() + " 재고가 부족합니다. (" + stockContext.getQuantity() + "개 남음)";
    }

    @Override
    public boolean shouldTrigger(Object context) {
        if (!(context instanceof ItemStockContext)) {
            throw new IllegalArgumentException("Invalid context for StockShortageStrategy");
        }
        ItemStockContext stockContext = (ItemStockContext) context;
        return stockContext.getQuantity() <= 5;
    }

}
