package com.example.backend.domain.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SupplyReturnApprovalContext {
    Long userId;
    String itemName;
    Long itemQuantity;
}
