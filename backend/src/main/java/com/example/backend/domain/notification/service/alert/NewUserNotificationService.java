package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NewManagerContext;
import com.example.backend.domain.notification.strategy.context.NewUserContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.role.entity.Role;
import com.example.backend.domain.role.service.RoleService;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.enums.RoleType;
import com.example.backend.global.security.jwt.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewUserNotificationService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final UserService userService;
    private final RoleService roleService;

    @Transactional
    public void notifyNewUser(Long requesterManagementDashboardId, String requesterName) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.NEW_USER);

        NewUserContext context = new NewUserContext(requesterName);

        Role managerRole = roleService.findRoleByRoleType(RoleType.MANAGER);

        // 요청 유저와 같은 대시보드의 매니저들 찾기
        List<User> managers = userService.findAllByRoleAndManagementDashboardId(managerRole, requesterManagementDashboardId);

        for (User manager : managers) {
            // 조건을 확인하고 알림을 생성
            if (strategy.shouldTrigger(context)) {
                // context를 사용하여 메시지 생성
                String msg = strategy.generateMessage(context);

                // NotificationRequestDTO에 메시지 전달
                notificationService.createNotification(new NotificationRequestDTO(
                        NotificationType.NEW_USER,
                        msg,
                        manager.getId())
                );
            }
        }
    }
}
