package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NewManagerContext;
import com.example.backend.domain.notification.strategy.context.NewUserContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewUserApprovedNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final UserService userService;

    @Transactional
    public void notifyNewUserApproved(Long requesterId, String userName) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.NEW_USER_APPROVED);

        NewUserContext context = new NewUserContext(userName);

        // 조건을 확인하고 알림을 생성
        if (strategy.shouldTrigger(context) && userService.isApprovedUser(requesterId)) {
            // context를 사용하여 메시지 생성
            String msg = strategy.generateMessage(context);

            // NotificationRequestDTO에 메시지 전달
            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.NEW_USER_APPROVED,
                    msg,
                    requesterId)
            );
        }
    }
}
