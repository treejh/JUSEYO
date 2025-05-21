package com.example.backend.domain.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyRequestApprovalContext {
    private Long userId;
    private String itemName;
    private Long itemQuantity;
}
