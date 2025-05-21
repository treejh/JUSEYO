package com.example.backend.domain.notification.event;

import com.example.backend.domain.notification.service.NewChatNotificationService;
import com.example.backend.domain.notification.service.StockNotificationService;
import com.example.backend.domain.notification.service.SupplyRequestApprovedNotificationService;
import com.example.backend.domain.notification.service.SupplyRequestNotificationService;
import com.example.backend.domain.notification.service.SupplyRequestRejectedNotificationService;
import com.example.backend.domain.notification.service.SupplyReturnNotificationService;
import com.example.backend.notification.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final SupplyRequestNotificationService supplyRequestNotificationService;
    private final StockNotificationService stockNotificationService;
    private final SupplyReturnNotificationService supplyReturnNotificationService;

    private final SupplyRequestApprovedNotificationService supplyRequestApprovedNotificationService;
    private final SupplyRequestRejectedNotificationService supplyRequestRejectedNotificationService;
    private final NewChatNotificationService newChatNotificationService;
    // 매니저
    // 비품 요청 알림
    @EventListener
    public void handleSupplyRequestCreated(SupplyRequestCreatedEvent event) {
        supplyRequestNotificationService.notifySupplyRequest(event.getItemName(), event.getRequestQuantity(), event.getRequesterName());
    }

    // 비품 반납 알림
    @EventListener
    public void handleSupplyReturnCreated(SupplyReturnCreatedEvent event) {
        supplyReturnNotificationService.notifySupplyReturn(event.getItemName(), event.getRequestQuantity(), event.getReturnerName());
    }

    // 재고 부족 알림
    @EventListener
    public void handleStockShortage(StockShortageEvent event) {
        stockNotificationService.checkAndNotifyLowStock(event.getSerialNumber(), event.getItemName(), event.getCurrentQuantity(), event.getMinimumQuantity());
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

    // 매니저 승인 알림
    public void handleNewManagerApproved() {

    }

    // 새로운 채팅
    @EventListener
    public void handleNewChat(NewChatEvent event) {
        newChatNotificationService.notifyNewChat(event.getTargetId(), event.getRoomId(), event.getSenderRole(), event.getSenderName());
    }

    // 추가 이벤트도 여기에 계속 추가하면 됨
}
