package com.example.backend.domain.notification.strategy.context;

import com.example.backend.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
@AllArgsConstructor
@Getter
public class NotReturnedContext {
    private final String itemName;
    private final LocalDateTime returnDate;
    private final ApprovalStatus approvalStatus;
}
