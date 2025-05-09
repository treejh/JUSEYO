package com.example.backend.supplyRequest.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class SupplyRequestRequestDto {
    private Long itemId;
    private Long userId;
    private String productName;
    private Long quantity;
    private String purpose;
    private LocalDateTime useDate;
    private LocalDateTime returnDate;
    private boolean rental;
}