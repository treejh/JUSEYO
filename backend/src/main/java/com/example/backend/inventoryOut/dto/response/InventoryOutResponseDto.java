package com.example.backend.inventoryout.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InventoryOutResponseDto {
    private Long id;
    private Long itemId;
    private Long quantity;
    private String outbound;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}