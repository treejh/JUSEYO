package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NewManagerContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.global.security.jwt.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewManagerApprovedNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final TokenService tokenService;

    @Transactional
    public void notifyNewManagerApproved(Long requesterId, String managerName) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.MANAGER_APPROVAL_ALERT);

        NewManagerContext context = new NewManagerContext(managerName);

        // 조건을 확인하고 알림을 생성
        if (strategy.shouldTrigger(context)) {
            // context를 사용하여 메시지 생성
            String msg = strategy.generateMessage(context);

            // NotificationRequestDTO에 메시지 전달
            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.MANAGER_APPROVAL_ALERT,
                    msg,
                    requesterId)
            );
        }
    }
}

