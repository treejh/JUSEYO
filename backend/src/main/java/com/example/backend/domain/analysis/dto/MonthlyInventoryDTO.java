package com.example.backend.domain.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.YearMonth;
import io.swagger.v3.oas.annotations.media.Schema;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "월별 입고 및 출고 수량 통계 DTO")
public class MonthlyInventoryDTO {

    @Schema(description = "해당 연월 (예: 2025-03)", example = "2025-03")
    private YearMonth month;

    @Schema(description = "해당 월의 입고 수량 총합", example = "120")
    private long inboundQuantity;

    @Schema(description = "해당 월의 출고 수량 총합", example = "100")
    private long outboundQuantity;
}
