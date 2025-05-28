package com.example.backend.domain.notification.event;

import com.example.backend.enums.Outbound;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnCreatedEvent {
    private Long managementDashboardId;
    private final String itemName;
    private final Long requestQuantity;
    private final String returnerName;
    private final Outbound returnStatus;

}