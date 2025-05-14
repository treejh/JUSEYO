package com.example.backend.notification.event;

import com.example.backend.notification.service.ReturnDueDateMonitoringService;
import com.example.backend.notification.service.StockMonitoringService;
import com.example.backend.notification.service.SupplyRequestMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final SupplyRequestMonitoringService supplyRequestMonitoringService;
    private final StockMonitoringService stockMonitoringService;

    @EventListener
    public void handleSupplyRequestCreated(SupplyRequestCreatedEvent event) {
        supplyRequestMonitoringService.notifySupplyRequest(event.getItem(), event.getRequester());
    }

    @EventListener
    public void handleStockShortage(StockShortageEvent event) {
        stockMonitoringService.checkAndNotifyLowStock(event.getItem());
    }

    // 추가 이벤트도 여기에 계속 추가하면 됨
}
