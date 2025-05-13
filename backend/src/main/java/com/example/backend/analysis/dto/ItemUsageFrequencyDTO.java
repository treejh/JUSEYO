package com.example.backend.analysis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "품목별 사용 빈도 DTO")
public class ItemUsageFrequencyDTO {

    @Schema(description = "품목 이름", example = "모니터")
    private String itemName;

    @Schema(description = "출고 기준 누적 사용 수량", example = "150")
    private long usageCount;
}
