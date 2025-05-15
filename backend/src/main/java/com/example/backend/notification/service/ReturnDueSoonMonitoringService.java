package com.example.backend.notification.service;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.context.ReturnDueDateContext;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.supplyReturn.repository.SupplyReturnRepository;
import com.example.backend.user.entity.User;
import com.example.backend.notification.strategy.factory.NotificationStrategyFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnDueSoonMonitoringService {

    private final SupplyRequestRepository supplyRequestRepository;
    private final NotificationService notificationService;
    private final NotificationStrategyFactory strategyFactory;
    private final SupplyReturnRepository supplyReturnRepository;

    public void checkAndNotifyUsersBeforeDueDate() {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.RETURN_DUE_SOON);
        List<SupplyRequest> requests = supplyRequestRepository.findAll();

        for (SupplyRequest request : requests) {
            if (request.getApprovalStatus() != ApprovalStatus.APPROVED) continue;   // 비품 사용 요청이 승인되지 않는 경우 skip
            if (supplyReturnRepository.existsBySupplyRequest(request)) continue; // 반납 요청서가 존재하는 경우 skip

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
