package com.example.backend.notification.strategy.context;

public class SupplyRequestContext {
    private final String itemName;
    private final String requesterName;

    public SupplyRequestContext(String itemName, String requesterName) {
        this.itemName = itemName;
        this.requesterName = requesterName;
    }

    public String getItemName() {
        return itemName;
    }

    public String getRequesterName() {
        return requesterName;
    }
}
