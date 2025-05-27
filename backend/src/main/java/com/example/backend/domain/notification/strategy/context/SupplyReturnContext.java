package com.example.backend.domain.notification.strategy.context;

import com.example.backend.enums.Outbound;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnContext {
    private final String itemName;
    private final Long requestQuantity;
    private final String requesterName;
    private final Outbound returnStatus;
}
