package com.example.backend.notification.service;

import com.example.backend.enums.RoleType;
import com.example.backend.item.entity.Item;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.service.strategy.NotificationStrategyFactory;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.context.ItemStockContext;
import com.example.backend.role.RoleService;
import com.example.backend.role.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMonitoringService {
    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;
    private final UserService userService;
    private final RoleService roleService;

    public void checkAndNotifyLowStock(Item item) {
        // STOCK_SHORTAGE 전략을 가져오고
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.STOCK_SHORTAGE);

        // ItemStockContext 생성
        ItemStockContext context = new ItemStockContext(item.getName(), item.getAvailableQuantity());

        Role managerRole = roleService.findRoleByRoleType(RoleType.MANAGER);

        // 모든 매니저에 대한 알림 생성
        List<User> managers = userService.findUsersByRole(managerRole);

        for (User manager : managers) {
            // 조건을 확인하고 알림을 생성
            if (strategy.shouldTrigger(context)) {
                // context를 사용하여 메시지 생성
                String msg = strategy.generateMessage(context);

                // NotificationRequestDTO에 메시지 전달
                notificationService.createNotification(new NotificationRequestDTO(
                        NotificationType.STOCK_SHORTAGE,
                        msg,
                        manager.getId())
                );
            }
        }
    }
}
