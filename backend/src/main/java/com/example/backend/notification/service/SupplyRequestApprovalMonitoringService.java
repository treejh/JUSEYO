package com.example.backend.notification.service;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.notification.dto.NotificationRequestDTO;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.strategy.NotificationStrategy;
import com.example.backend.notification.strategy.NotificationStrategyFactory;
import com.example.backend.notification.strategy.context.SupplyRequestApprovedContext;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.supplyRequest.entity.SupplyRequest;
import com.example.backend.supplyRequest.repository.SupplyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupplyRequestApprovalMonitoringService {

    private final NotificationStrategyFactory strategyFactory;
    private final NotificationService notificationService;

    public void notifyIfApproved(SupplyRequest request) {
        if (request.getApprovalStatus() != ApprovalStatus.APPROVED) return;

        NotificationStrategy strategy = strategyFactory.getStrategy(NotificationType.SUPPLY_REQUEST_APPROVED);

        SupplyRequestApprovedContext context = new SupplyRequestApprovedContext(
                request.getProductName(),
                request.getUser().getId()
        );

        if (strategy.shouldTrigger(context)) {
            String message = strategy.generateMessage(context);

            notificationService.createNotification(new NotificationRequestDTO(
                    NotificationType.SUPPLY_REQUEST_APPROVED,
                    message,
                    context.getUserId()
            ));
        }
    }
}
