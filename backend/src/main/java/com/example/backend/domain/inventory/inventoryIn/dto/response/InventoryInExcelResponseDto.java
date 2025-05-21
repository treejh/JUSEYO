package com.example.backend.domain.inventory.inventoryIn.dto.response;

import com.example.backend.enums.Inbound;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 엑셀 다운로드 전용 입고내역 DTO
 */
@Getter
@Builder
@AllArgsConstructor
public class InventoryInExcelResponseDto {

    @Schema(description = "입고 ID")
    private Long id;

    @Schema(description = "아이템 ID")
    private Long itemId;

    @Schema(description = "아이템 이름")
    private String itemName;

    @Schema(description = "카테고리 이름")
    private String categoryName;

    @Schema(description = "입고 수량")
    private Long quantity;

    @Schema(description = "입고 유형 (PURCHASE, RETURN)")
    private Inbound inbound;

    @Schema(description = "입고 등록 일시")
    private LocalDateTime createdAt;

    @Schema(description = "입고 수정 일시")
    private LocalDateTime modifiedAt;
}
