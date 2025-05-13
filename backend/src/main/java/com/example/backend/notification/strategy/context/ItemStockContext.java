package com.example.backend.notification.strategy.context;

public class ItemStockContext {
    private final String itemName;
    private final Long quantity;

    public ItemStockContext(String itemName, Long quantity) {
        this.itemName = itemName;
        this.quantity = quantity;
    }

    public String getItemName() {
        return itemName;
    }

    public Long getQuantity() {
        return quantity;
    }
}

