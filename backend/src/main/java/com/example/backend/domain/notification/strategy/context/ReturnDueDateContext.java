package com.example.backend.domain.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class ReturnDueDateContext {
    private final String itemName;
    private final LocalDateTime returnDate;

}
