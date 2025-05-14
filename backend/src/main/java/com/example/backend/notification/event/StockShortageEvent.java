package com.example.backend.notification.event;

import com.example.backend.item.entity.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StockShortageEvent {
    private final Item item;  // 재고가 부족한 아이템
}
