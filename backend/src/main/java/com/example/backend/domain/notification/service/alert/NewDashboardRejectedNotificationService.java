package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NewDashboardContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.global.security.jwt.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor

public class NewDashboardRejectedNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final TokenService tokenService;
    private final NotificationService notificationService;

    @Transactional
    public void handleNewDashboardApproved(String dashboardName) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.ADMIN_REJECTION_ALERT);

        NewDashboardContext context = new NewDashboardContext(dashboardName);

        Long userId = tokenService.getIdFromToken();
        if (strategy.shouldTrigger(context)) {

            String msg = strategy.generateMessage(context);

            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.ADMIN_REJECTION_ALERT,
                    msg,
                    userId
            ));
        }
    }
}
