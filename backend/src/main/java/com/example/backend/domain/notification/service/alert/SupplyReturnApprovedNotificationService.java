package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.SupplyRequestApprovalContext;
import com.example.backend.domain.notification.strategy.context.SupplyReturnApprovalContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplyReturnApprovedNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;

    @Transactional
    public void notifyIfApproved(Long userId, String itemName, Long itemQuantity) {

        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.SUPPLY_RETURN_APPROVED);

        SupplyReturnApprovalContext context = new SupplyReturnApprovalContext(
                userId, itemName, itemQuantity
        );

        if (strategy.shouldTrigger(context)) {
            String message = strategy.generateMessage(context);

            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.SUPPLY_RETURN_APPROVED,
                    message,
                    context.getUserId()
            ));
        }
    }
}
