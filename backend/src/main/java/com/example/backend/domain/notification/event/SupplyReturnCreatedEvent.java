package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnCreatedEvent {
    private final String itemName;
    private final Long requestQuantity;
    private final String returnerName;

}