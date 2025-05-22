package com.example.backend.domain.notification.service;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.strategy.NotificationStrategy;
import com.example.backend.domain.notification.strategy.context.SupplyRequestApprovalContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.enums.ApprovalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplyRequestRejectedNotificationService {

    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;

    @Transactional
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