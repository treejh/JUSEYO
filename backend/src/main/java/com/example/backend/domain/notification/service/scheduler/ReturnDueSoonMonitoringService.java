package com.example.backend.domain.notification.service.scheduler;

import com.example.backend.domain.notification.dto.NotificationRequestDTO;
import com.example.backend.domain.notification.entity.NotificationType;
import com.example.backend.domain.notification.service.NotificationService;
import com.example.backend.domain.notification.strategy.strategy.NotificationStrategy;
import com.example.backend.domain.notification.strategy.context.ReturnDueDateContext;
import com.example.backend.domain.notification.strategy.factory.NotificationStrategyFactory;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.domain.supply.supplyRequest.entity.SupplyRequest;
import com.example.backend.domain.supply.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.domain.supply.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnDueSoonMonitoringService {

    private final SupplyRequestRepository supplyRequestRepository;
    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;
    private final SupplyReturnRepository supplyReturnRepository;

//        @Scheduled(cron = "0 0 8 * * *") // 배포용 : 매일 오전 8시 실행
    @Scheduled(fixedRate = 60000)   // 테스트용 : 1분마다
    @Transactional
    public void scheduledCheckAndNotify() {
        checkAndNotifyUsersBeforeDueDate();
    }

    @Transactional
    public void checkAndNotifyUsersBeforeDueDate() {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.RETURN_DUE_SOON);
        List<SupplyRequest> requests = supplyRequestRepository.findAll();

        for (SupplyRequest request : requests) {
            if (request.getApprovalStatus() != ApprovalStatus.APPROVED) continue;   // 비품 사용 요청이 승인되지 않는 경우 skip
            if (supplyReturnRepository.existsBySupplyRequestId(request.getId())) continue; // 반납 요청서가 존재하는 경우 skip

            ReturnDueDateContext context = new ReturnDueDateContext(
                    request.getItem().getName(),
                    request.getReturnDate()
            );

            if (strategy.shouldTrigger(context)) {
                String msg = strategy.generateMessage(context);
                User user = request.getUser();
                if (user != null) {
                    notificationService.createNotification(new NotificationRequestDTO(
                            NotificationType.RETURN_DUE_SOON,
                            msg,
                            user.getId()
                    ));
                }
            }
        }
    }
}
