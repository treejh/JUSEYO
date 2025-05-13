package com.example.backend.notification.strategy.context;

import java.time.LocalDateTime;

public class ReturnDueDateContext {
    private final String itemName;
    private final LocalDateTime returnDate;

    public ReturnDueDateContext(String itemName, LocalDateTime returnDate) {
        this.itemName = itemName;
        this.returnDate = returnDate;
    }

    public String getItemName() {
        return itemName;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }
}
