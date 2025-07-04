package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.notification.strategy.context.SupplyRequestApprovalContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplyRequestApprovedNotificationService {

    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final UserService userService;

    @Transactional
    public void notifyIfApproved(Long userId, String itemName, Long itemQuantity) {

        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.SUPPLY_REQUEST_APPROVED);

        SupplyRequestApprovalContext context = new SupplyRequestApprovalContext(
                userId, itemName, itemQuantity
        );

        if (strategy.shouldTrigger(context) && userService.isApprovedUser(userId)) {
            String message = strategy.generateMessage(context);

            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.SUPPLY_REQUEST_APPROVED,
                    message,
                    userId
            ));
        }
    }
}
