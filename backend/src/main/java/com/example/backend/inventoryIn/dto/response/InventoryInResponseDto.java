package com.example.backend.inventoryIn.dto.response;

import com.example.backend.enums.Inbound;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class InventoryInResponseDto {

    @Schema(description = "입고 ID")
    private Long id;

    @Schema(description = "아이템 ID")
    private Long itemId;

    @Schema(description = "아이템 이름")
    private String itemName;

    @Schema(description = "입고 수량")
    private Long quantity;

    @Schema(description = "입고 유형", example = "PURCHASE")
    private Inbound inbound;

    @Schema(description = "입고 등록 일시")
    private LocalDateTime createdAt;
}
