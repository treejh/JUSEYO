package com.example.backend.inventoryOut.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryOutResponseDto {
    private Long id;
    private Long supplyRequestId;
    private Long itemId;
    private Long categoryId;
    private Long managementId;
    private Long quantity;
    private String outbound;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}