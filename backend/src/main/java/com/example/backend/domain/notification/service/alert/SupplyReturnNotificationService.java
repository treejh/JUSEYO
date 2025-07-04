package com.example.backend.domain.notification.service.alert;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.notification.strategy.context.SupplyReturnContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.enums.Outbound;
import com.example.backend.enums.RoleType;
import com.example.backend.domain.role.service.RoleService;
import com.example.backend.domain.role.entity.Role;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplyReturnNotificationService {

    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final UserService userService;
    private final RoleService roleService;

    @Transactional
    public void notifySupplyReturn(Long managementDashboardId, String itemName, Long itemQuantity, String returnerName, Outbound returnStatus) {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.SUPPLY_RETURN);

        SupplyReturnContext context = new SupplyReturnContext(itemName, itemQuantity, returnerName, returnStatus);

        Role managerRole = roleService.findRoleByRoleType(RoleType.MANAGER);

        // 모든 매니저에 대한 알림 생성
        List<User> managers = userService.findAllByRoleAndManagementDashboardId(managerRole,  managementDashboardId);

        for (User manager : managers) {
            // 조건을 확인하고 알림을 생성
            if (strategy.shouldTrigger(context) && userService.isApprovedUser(manager.getId())) {
                // context를 사용하여 메시지 생성
                String msg = strategy.generateMessage(context);

                // NotificationRequestDTO에 메시지 전달
                notificationService.createNotification(new NotificationRequestDTO(
                        NotificationType.SUPPLY_RETURN,
                        msg,
                        manager.getId())
                );
            }
        }
    }
}
