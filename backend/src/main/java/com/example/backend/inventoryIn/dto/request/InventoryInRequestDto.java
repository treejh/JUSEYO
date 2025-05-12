package com.example.backend.inventoryIn.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryInRequestDto {
    private Long itemId;
    private Long quantity;
    private String inbound;  // Inbound enum name
    private String name;
    private Long categoryId;
    private Long managementId;
    private String purchaseSource;
    private String location;
    private Boolean isReturnRequired;
}