package com.example.backend.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnContext {
    private final String itemName;
    private final Long requestQuantity;
    private final String requesterName;
}
