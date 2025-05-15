package com.example.backend.notification.event;

import com.example.backend.item.entity.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StockShortageEvent {
    private final String serialNumber;
    private final String itemName;
    private final Long currentQuantity;
    private final Long minimumQuantity;
}
