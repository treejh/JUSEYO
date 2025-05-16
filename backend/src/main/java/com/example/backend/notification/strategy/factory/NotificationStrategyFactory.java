package com.example.backend.notification.strategy.factory;


import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.ReturnDueDateExceededStrategy;
import com.example.backend.notification.strategy.StockShortageStrategy;
import com.example.backend.notification.strategy.SupplyRequestStrategy;
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