package com.example.backend.domain.analysis.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "카테고리별 총 수량 및 종류 수 DTO")
public class CategorySummaryDTO {

    @Schema(description = "해당 카테고리 내 비품 총 수량")
    private long totalQuantity;

    @Schema(description = "해당 카테고리에 속한 비품 종류 수")
    private long itemTypeCount;
}
