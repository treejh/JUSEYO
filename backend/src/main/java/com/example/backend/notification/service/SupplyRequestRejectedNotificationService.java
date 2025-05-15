package com.example.backend.notification.service;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.notification.strategy.context.SupplyRequestApprovalContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupplyRequestRejectedNotificationService {

    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;

    public void notifyIfApproved(Long userId, String itemName, Long itemQuantity, ApprovalStatus approvalStatus) {
        if (approvalStatus != ApprovalStatus.REJECTED) return;

        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.SUPPLY_REQUEST_REJECTED);

        SupplyRequestApprovalContext context = new SupplyRequestApprovalContext(
                userId, itemName, itemQuantity
        );

        if (strategy.shouldTrigger(context)) {
            String message = strategy.generateMessage(context);

            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.SUPPLY_REQUEST_REJECTED,
                    message,
                    context.getUserId()
            ));
        }
    }
}