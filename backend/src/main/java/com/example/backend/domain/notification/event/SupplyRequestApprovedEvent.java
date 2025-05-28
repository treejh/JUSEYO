package com.example.backend.domain.notification.event;

import com.example.backend.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupplyRequestApprovedEvent {
    private final Long userId;
    private final String itemName;
    private final Long itemQuantity;
}
