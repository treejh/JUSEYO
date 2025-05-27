package com.example.backend.domain.notification.service.scheduler;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.NotReturnedContext;
import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.role.entity.Role;
import com.example.backend.domain.role.service.RoleService;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.domain.user.service.UserService;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.RoleType;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
public class NotReturnedYetMonitoringService {
    private final SupplyRequestRepository supplyRequestRepository;
    private final SupplyReturnRepository supplyReturnRepository;
    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;
    private final RoleService roleService;
    private final UserService userService;

    //    @Scheduled(cron = "0 0 8 * * *") // 배포용 : 매일 오전 8시 실행
    @Scheduled(fixedRate = 600000)   // 테스트용 : 10분마다
    @Transactional
    public void scheduledCheckAndNotify() {
        checkAndNotifyNotReturnedYet();
    }

    @Transactional
    public void checkAndNotifyNotReturnedYet() {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.NOT_RETURNED_YET);
        List<SupplyRequest> requests = supplyRequestRepository.findAll();

        // 매니저 Role과 유저 조회
        Role managerRole = roleService.findRoleByRoleType(RoleType.MANAGER);
        List<User> managers = userService.findUsersByRole(managerRole);

        for (SupplyRequest request : requests) {
            NotReturnedContext context = new NotReturnedContext(
                    request.getProductName(),
                    request.getReturnDate(),
                    request.getApprovalStatus()
            );

            if (strategy.shouldTrigger(context)) {
                String msg = strategy.generateMessage(context);
                User user = request.getUser();
                notificationService.createNotification(new NotificationRequestDTO(
                        NotificationType.NOT_RETURNED_YET,
                        msg,
                        user.getId()
                ));
                for (User manager : managers) {
                    notificationService.createNotification(new NotificationRequestDTO(
                            NotificationType.NOT_RETURNED_YET,
                            msg,
                            manager.getId()
                    ));
                }
            }
        }
    }
}
