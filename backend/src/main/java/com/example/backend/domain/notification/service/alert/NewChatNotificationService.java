package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.enums.RoleType;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.notification.strategy.context.NewChatContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewChatNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final UserService userService;

    @Transactional
    public void notifyNewChat(Long targetId, Long roomId, RoleType role, String name) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.NEW_CHAT);

        NewChatContext context = new NewChatContext(targetId, roomId, role, name);

        // 조건을 확인하고 알림을 생성
        if (strategy.shouldTrigger(context) && userService.isApprovedUser(targetId)) {
            // context를 사용하여 메시지 생성
            String msg = strategy.generateMessage(context);

            // NotificationRequestDTO에 메시지 전달
            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.NEW_CHAT,
                    msg,
                    targetId)
            );
        }
    }
}

