package com.example.backend.notification.event;

import com.example.backend.item.entity.Item;
import com.example.backend.user.entity.User;
import lombok.Getter;

@Getter
public class SupplyRequestCreatedEvent {
    private final Item item;
    private final User requester;

    public SupplyRequestCreatedEvent(Item item, User requester) {
        this.item = item;
        this.requester = requester;
    }

}
