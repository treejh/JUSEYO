package com.example.backend.notification.service;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.context.ReturnDueSoonContext;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import com.example.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnDueSoonMonitoringService {

    private final SupplyRequestRepository supplyRequestRepository;
    private final NotificationService notificationService;
    private final com.example.backend.notification.strategy.NotificationStrategyFactory strategyFactory;

    public void checkAndNotifyUsersBeforeDueDate() {
        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.RETURN_DUE_SOON);
        List<SupplyRequest> requests = supplyRequestRepository.findAll();

        for (SupplyRequest request : requests) {
            if (request.getApprovalStatus() != ApprovalStatus.APPROVED) continue;

            ReturnDueSoonContext context = new ReturnDueSoonContext(
                    request.getProductName(),
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
