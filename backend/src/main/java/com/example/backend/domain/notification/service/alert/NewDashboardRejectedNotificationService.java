package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NewDashboardApproveOrNotContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
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
    private final UserService userService;

    @Transactional
    public void handleNewDashboardApproved(Long dashboardId, String dashboardName) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.ADMIN_REJECTION_ALERT);

        NewDashboardApproveOrNotContext context = new NewDashboardApproveOrNotContext(dashboardName);

        User user = userService.findUserByDashboardIdAndIsInitialManager(dashboardId, true);

        if (strategy.shouldTrigger(context)&& userService.isApprovedUser(user.getId())) {

            String msg = strategy.generateMessage(context);

            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.ADMIN_REJECTION_ALERT,
                    msg,
                    user.getId()
            ));
        }
    }
}
