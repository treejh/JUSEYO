package com.example.backend.notification.event;

import com.example.backend.notification.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final SupplyRequestNotificationService supplyRequestMonitoringService;
    private final StockNotificationService stockMonitoringService;
    private final SupplyReturnNotificationService supplyReturnMonitoringService;

    private final SupplyRequestApprovedNotificationService supplyRequestApprovedNotificationService;
    private final SupplyRequestRejectedNotificationService supplyRequestRejectedNotificationService;

    // 매니저
    // 비품 요청 알림
    @EventListener
    public void handleSupplyRequestCreated(SupplyRequestCreatedEvent event) {
        supplyRequestMonitoringService.notifySupplyRequest(event.getItemName(), event.getRequestQuantity(), event.getRequesterName());
    }

    // 비품 반납 알림
    @EventListener
    public void handleSupplyReturnCreated(SupplyReturnCreatedEvent event) {
        supplyReturnMonitoringService.notifySupplyReturn(event.getItemName(), event.getRequestQuantity(), event.getReturnerName());
    }

    // 재고 부족 알림
    @EventListener
    public void handleStockShortage(StockShortageEvent event) {
        stockMonitoringService.checkAndNotifyLowStock(event.getSerialNumber(), event.getItemName(), event.getCurrentQuantity(), event.getMinimumQuantity());
    }

    // 회원
    // 비품 요청 승인 알림
    @EventListener
    public void handleSupplyRequestApproved(SupplyRequestApprovedEvent event) {
        supplyRequestApprovedNotificationService.notifyIfApproved(event.getUserId(), event.getItemName(), event.getItemQuantity(), event.getApprovalStatus());
    }

    // 비품 요청 반려 알림
    @EventListener
    public void handleSupplyRequestRejected(SupplyRequestApprovedEvent event) {
        supplyRequestRejectedNotificationService.notifyIfApproved(event.getUserId(), event.getItemName(), event.getItemQuantity(), event.getApprovalStatus());
    }

    // 기타
    // 관리자 페이지 승인 알림
    public void handleManagementDashboardCreateApproved(ManagementDashboardCreateApproved dashboardCreateApproved) {

    }



    // 추가 이벤트도 여기에 계속 추가하면 됨
}
