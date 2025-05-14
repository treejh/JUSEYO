package com.example.backend.notification.event;

import com.example.backend.item.entity.Item;
import com.example.backend.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyReturnCreatedEvent {
    private final String itemName;
    private final Long requestQuantity;
    private final String returnerName;

}