package com.example.backend.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class ItemStockContext {
    private final String serialNumber;
    private final String itemName;
    private final Long availableQuantity;
    private final Long minimumQuantity;


}

