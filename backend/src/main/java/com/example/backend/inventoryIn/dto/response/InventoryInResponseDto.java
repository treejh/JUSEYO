package com.example.backend.inventoryIn.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryInResponseDto {
    private Long id;
    private Long itemId;
    private Long quantity;
    private String inbound;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}