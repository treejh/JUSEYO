package com.example.backend.domain.notification.strategy.factory;


import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.strategy.strategy.*;
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

        strategyMap.put(NotificationType.ADMIN_APPROVAL_ALERT, new NewDashboardApprovedStrategy());
        strategyMap.put(NotificationType.ADMIN_REJECTION_ALERT, new NewDashboardRejectedStrategy());

        strategyMap.put(NotificationType.MANAGER_APPROVAL_ALERT, new NewManagerApprovedStrategy());
        strategyMap.put(NotificationType.MANAGER_REJECTION_ALERT, new NewManagerRejectedStrategy());
        strategyMap.put(NotificationType.SUPPLY_REQUEST_DELAYED, new SupplyRequestDelayedStrategy());


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