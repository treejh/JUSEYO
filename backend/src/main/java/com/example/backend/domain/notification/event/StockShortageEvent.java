package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StockShortageEvent {
    private final Long managementDashboardId;
    private final String serialNumber;
    private final String itemName;
    private final Long currentQuantity;
    private final Long minimumQuantity;
}
