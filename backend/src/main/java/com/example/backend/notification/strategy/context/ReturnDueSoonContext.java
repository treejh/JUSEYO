package com.example.backend.notification.strategy.context;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReturnDueSoonContext {
    private String productName;
    private LocalDateTime returnDate;
}
