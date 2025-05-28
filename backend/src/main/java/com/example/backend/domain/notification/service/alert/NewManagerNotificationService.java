package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NewManagerContext;
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
public class NewManagerNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final TokenService tokenService;
    private final UserService userService;

    @Transactional
    public void notifyNewManager(Long requesterManagementDashboardId, String requesterName) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.NEW_MANAGER);

        NewManagerContext context = new NewManagerContext(requesterName);

        // 요청 매니저와 같은 대시보드의 이니셜 매니저 찾기
        User user = userService.findUserByDashboardIdAndIsInitialManager(requesterManagementDashboardId,  true);
        // 조건을 확인하고 알림을 생성
        if (strategy.shouldTrigger(context)) {
            // context를 사용하여 메시지 생성
            String msg = strategy.generateMessage(context);

            // NotificationRequestDTO에 메시지 전달
            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.NEW_MANAGER,
                    msg,
                    user.getId())
            );
        }
    }
}
