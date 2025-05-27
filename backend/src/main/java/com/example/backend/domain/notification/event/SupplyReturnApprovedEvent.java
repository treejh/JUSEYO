package com.example.backend.domain.notification.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnApprovedEvent {
    private final Long userId;
    private final String itemName;
    private final Long itemQuantity;
}
