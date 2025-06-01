package com.example.backend.domain.notification.event;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnRejectedEvent {
    private final Long userId;
    private final String itemName;
    private final Long itemQuantity;
}
