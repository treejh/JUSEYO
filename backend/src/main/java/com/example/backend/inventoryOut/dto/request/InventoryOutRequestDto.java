package com.example.backend.inventoryOut.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryOutRequestDto {
    private Long supplyRequestId;
    private Long itemId;
    private Long categoryId;
    private Long managementId;
    private Long quantity;
    private String outbound;  // Outbound enum name
}