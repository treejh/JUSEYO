package com.example.backend.domain.notification.event;

import com.example.backend.domain.notification.service.alert.*;
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

    private final NewDashboardApprovedNotificationService newDashboardApprovedNotificationService;
    private final NewDashboardRejectedNotificationService newDashboardRejectedNotificationService;
    private final NewManagerApprovedNotificationService newManagerApprovedNotificationService;
    private final NewManagerRejectedNotificationService newManagerRejectedNotificationService;
    private final SupplyReturnApprovedNotificationService supplyReturnApprovedNotificationService;

    // 매니저
    // 비품 요청 알림
    @EventListener
    public void handleSupplyRequestCreated(SupplyRequestCreatedEvent event) {
        supplyRequestNotificationService.notifySupplyRequest(event.getItemName(), event.getRequestQuantity(), event.getRequesterName());
    }

    // 비품 반납 알림
    @EventListener
    public void handleSupplyReturnCreated(SupplyReturnCreatedEvent event) {
        supplyReturnNotificationService.notifySupplyReturn(event.getItemName(), event.getRequestQuantity(), event.getReturnerName(), event.getReturnStatus());
    }

    // 재고 부족 알림
    @EventListener
    public void handleStockShortage(StockShortageEvent event) {
        stockNotificationService.checkAndNotifyLowStock(event.getSerialNumber(), event.getItemName(), event.getCurrentQuantity(), event.getMinimumQuantity());
    }

    @EventListener
    // 관리자 페이지 승인 알림
    public void handleNewDashboardApproved(NewDashboardApprovedEvent event) {
        newDashboardApprovedNotificationService.handleNewDashboardApproved(event.getDashboardId(), event.getDashboardName());
    }

    @EventListener
    // 관리자 페이지 반려 알림
    public void handleNewDashboardRejected(NewDashboardRejectedEvent event) {
        newDashboardRejectedNotificationService.handleNewDashboardApproved(event.getDashboardId(), event.getDashboardName());
    }

    @EventListener
    // 매니저 승인 알림
    public void handleNewManagerApproved(NewManagerApprovedEvent event) {
        newManagerApprovedNotificationService.notifyNewManagerApproved(event.getRequesterId(), event.managerName);
    }

    @EventListener
    // 매니저 거부 알림
    public void handleNewManagerRejected(NewManagerRejectedEvent event) {
        newManagerRejectedNotificationService.notifyNewManagerRejected(event.getRequesterId(), event.managerName);
    }

    // 회원
    // 비품 요청 승인 알림
    @EventListener
    public void handleSupplyRequestApproved(SupplyRequestApprovedEvent event) {
        supplyRequestApprovedNotificationService.notifyIfApproved(event.getUserId(), event.getItemName(), event.getItemQuantity());
    }

    // 비품 요청 반려 알림
    @EventListener
    public void handleSupplyRequestRejected(SupplyRequestRejectedEvent event) {
        supplyRequestRejectedNotificationService.notifyIfApproved(event.getUserId(), event.getItemName(), event.getItemQuantity());
    }

    // 비품 반납 승인 알림
    @EventListener
    public void handleSupplyReturnApproved(SupplyReturnApprovedEvent event) {
        supplyReturnApprovedNotificationService.notifyIfApproved(event.getUserId(), event.getItemName(), event.getItemQuantity());
    }

    // 기타
    // 새로운 채팅
    @EventListener
    public void handleNewChat(NewChatEvent event) {
        newChatNotificationService.notifyNewChat(event.getTargetId(), event.getRoomId(), event.getSenderRole(), event.getSenderName());
    }

    // 추가 이벤트도 여기에 계속 추가하면 됨
}
