package com.example.backend.enums;

public enum RentStatus {
    RENTING("대여중"),
    OVERDUE("연체"),
    RETURNED("반납 완료");

    private final String description;

    RentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
