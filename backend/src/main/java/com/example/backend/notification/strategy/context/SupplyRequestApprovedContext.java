package com.example.backend.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyRequestApprovedContext {
    private String itemName;
    private Long userId;
}
