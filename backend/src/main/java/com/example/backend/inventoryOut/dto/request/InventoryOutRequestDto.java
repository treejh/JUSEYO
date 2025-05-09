package com.example.backend.inventoryOut.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryOutRequestDto {
    private Long itemId;
    private Long quantity;
    private String outbound;  // Outbound enum name
}