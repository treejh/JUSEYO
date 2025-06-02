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
        // 매니저
        strategyMap.put(NotificationType.SUPPLY_REQUEST, new SupplyRequestStrategy());
        strategyMap.put(NotificationType.SUPPLY_RETURN, new SupplyReturnStrategy());
        strategyMap.put(NotificationType.STOCK_SHORTAGE, new StockShortageStrategy());
        strategyMap.put(NotificationType.RETURN_DUE_DATE_EXCEEDED, new ReturnDueDateExceededStrategy());
        strategyMap.put(NotificationType.NOT_RETURNED_YET, new NotReturnedYetStrategy());

        strategyMap.put(NotificationType.ADMIN_APPROVAL_ALERT, new NewDashboardApprovedStrategy());
        strategyMap.put(NotificationType.ADMIN_REJECTION_ALERT, new NewDashboardRejectedStrategy());
//        strategyMap.put(NotificationType.NEW_MANAGEMENT_DASHBOARD, new NewDashboardStrategy());

        strategyMap.put(NotificationType.MANAGER_APPROVAL_ALERT, new NewManagerApprovedStrategy());
        strategyMap.put(NotificationType.MANAGER_REJECTION_ALERT, new NewManagerRejectedStrategy());
        strategyMap.put(NotificationType.NEW_MANAGER, new NewManagerStrategy());

        strategyMap.put(NotificationType.NEW_USER, new NewUserStrategy());

        // 회원
        strategyMap.put(NotificationType.RETURN_DUE_SOON, new ReturnDueSoonStrategy());
        strategyMap.put(NotificationType.SUPPLY_REQUEST_APPROVED, new SupplyRequestApprovedStrategy());
        strategyMap.put(NotificationType.SUPPLY_REQUEST_REJECTED, new SupplyRequestRejectedStrategy());
        strategyMap.put(NotificationType.SUPPLY_REQUEST_DELAYED, new SupplyRequestDelayedStrategy());
        strategyMap.put(NotificationType.SUPPLY_RETURN_APPROVED, new SupplyReturnApprovedStrategy());
        strategyMap.put(NotificationType.SUPPLY_RETURN_REJECTED, new SupplyReturnRejectedStrategy());
        strategyMap.put(NotificationType.NEW_USER_APPROVED, new NewUserApprovedStrategy());
        strategyMap.put(NotificationType.NEW_USER_REJECTED, new NewUserRejectedStrategy());


        // 공통
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