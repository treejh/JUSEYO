package com.example.backend.domain.notification.strategy.context;

import com.example.backend.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
@Getter
@AllArgsConstructor
public class SupplyRequestDelayedContext {
    private final String itemName;
    private final LocalDateTime createdAt;
    private final LocalDateTime usageDate;
    private final ApprovalStatus approvalStatus;
}
