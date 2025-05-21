package com.example.backend.domain.Inventory.inventoryOut.dto.request;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class InventoryOutRequestDto {
    private Long supplyRequestId;
    private Long itemId;
    private Long categoryId;
    private Long managementId;
    private Long quantity;
    private String outbound;  // Outbound enum name
}