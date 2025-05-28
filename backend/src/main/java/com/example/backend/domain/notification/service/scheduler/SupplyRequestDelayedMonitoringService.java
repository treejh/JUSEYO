package com.example.backend.domain.notification.service.scheduler;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;
import com.example.backend.domain.notification.strategy.context.SupplyRequestContext;
import com.example.backend.domain.notification.strategy.context.SupplyRequestDelayedContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.domain.user.entity.User;
import com.example.backend.enums.ApprovalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplyRequestDelayedMonitoringService {
    private final SupplyRequestRepository supplyRequestRepository;
    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;
    private final SupplyReturnRepository supplyReturnRepository;

        @Scheduled(cron = "0 0 8 * * *") // 배포용 : 매일 오전 8시 실행
//    @Scheduled(fixedRate = 60000)   // 테스트용 : 1분마다
    @Transactional
    public void scheduledCheckAndNotify() {
        checkAndNotifyDelayedRequests();
    }

    @Transactional
    public void checkAndNotifyDelayedRequests() {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.SUPPLY_REQUEST_DELAYED);
        List<SupplyRequest> requests = supplyRequestRepository.findAll();

        for (SupplyRequest request : requests) {
            SupplyRequestDelayedContext context = new SupplyRequestDelayedContext(
                    request.getItem().getName(),
                    request.getCreatedAt(),
                    request.getUseDate(),
                    request.getApprovalStatus()
            );

            if (strategy.shouldTrigger(context)) {
                String msg = strategy.generateMessage(context);
                User user = request.getUser();
                if (user != null) {
                    notificationService.createNotification(new NotificationRequestDTO(
                            NotificationType.SUPPLY_REQUEST_DELAYED,
                            msg,
                            user.getId()
                    ));
                }
            }
        }
    }
}
