package com.example.backend.domain.notification.strategy.factory;


import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.strategy.NewChatStrategy;
import com.example.backend.domain.notification.strategy.NotificationStrategy;
import com.example.backend.domain.notification.strategy.ReturnDueDateExceededStrategy;
import com.example.backend.domain.notification.strategy.ReturnDueSoonStrategy;
import com.example.backend.domain.notification.strategy.StockShortageStrategy;
import com.example.backend.domain.notification.strategy.SupplyRequestApprovedStrategy;
import com.example.backend.domain.notification.strategy.SupplyRequestRejectedStrategy;
import com.example.backend.domain.notification.strategy.SupplyRequestStrategy;
import com.example.backend.domain.notification.strategy.SupplyReturnStrategy;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class NotificationStrategyFactory {

    private final Map<NotificationType, NotificationStrategy> strategyMap = new EnumMap<>(NotificationType.class);

    @PostConstruct
    public void init() {
        strategyMap.put(NotificationType.SUPPLY_REQUEST, new SupplyRequestStrategy());
        strategyMap.put(NotificationType.STOCK_SHORTAGE, new StockShortageStrategy());
        strategyMap.put(NotificationType.RETURN_DUE_DATE_EXCEEDED, new ReturnDueDateExceededStrategy());
        strategyMap.put(NotificationType.RETURN_DUE_SOON, new ReturnDueSoonStrategy());
        strategyMap.put(NotificationType.SUPPLY_REQUEST_APPROVED, new SupplyRequestApprovedStrategy());
        strategyMap.put(NotificationType.SUPPLY_REQUEST_REJECTED, new SupplyRequestRejectedStrategy());
        strategyMap.put(NotificationType.SUPPLY_RETURN, new SupplyReturnStrategy());
        strategyMap.put(NotificationType.NEW_CHAT, new NewChatStrategy());

        // ⚠️ 여기에 나머지 전략 등록
    }

    public NotificationStrategy getStrategy(NotificationType type) {
        NotificationStrategy strategy = strategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No strategy found for type: " + type);
        }
        return strategy;
    }
}