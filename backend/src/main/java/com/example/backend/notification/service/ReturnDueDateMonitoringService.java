package com.example.backend.notification.service;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.RoleType;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.context.ReturnDueDateContext;
import com.example.backend.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.role.RoleService;
import com.example.backend.role.entity.Role;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.user.entity.User;

import com.example.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnDueDateMonitoringService {

    private final SupplyRequestRepository supplyRequestRepository;
    private final SupplyReturnRepository supplyReturnRepository;
    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;
    private final RoleService roleService;
    private final UserService userService;

//    @Scheduled(cron = "0 0 0 * * *") // 배포용 : 매일 자정 실행
    @Scheduled(fixedRate = 600000)   // 테스트용 : 10분마다
    @Transactional
    public void scheduledCheckAndNotify() {
        checkAndNotifyOverdueReturns();
    }

    @Transactional
    public void checkAndNotifyOverdueReturns() {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.RETURN_DUE_DATE_EXCEEDED);
        List<SupplyRequest> requests = supplyRequestRepository.findAll();

        // 매니저 Role과 유저 조회
        Role managerRole = roleService.findRoleByRoleType(RoleType.MANAGER);
        List<User> managers = userService.findUsersByRole(managerRole);

        for (SupplyRequest request : requests) {
            if (request.getApprovalStatus() != ApprovalStatus.APPROVED) continue; // 대여 요청서 승인상태가 승인되지 않은 아이템은 skip
            if (supplyReturnRepository.existsBySupplyRequest(request)) continue; // 반납 요청서가 존재하는 경우 skip

            ReturnDueDateContext context = new ReturnDueDateContext(
                    request.getProductName(),
                    request.getReturnDate()
            );

            if (strategy.shouldTrigger(context)) {
                String msg = strategy.generateMessage(context);

                for (User manager : managers) {
                    notificationService.createNotification(new NotificationRequestDTO(
                            NotificationType.RETURN_DUE_DATE_EXCEEDED,
                            msg,
                            manager.getId()
                    ));
                }
            }
        }
    }
}
