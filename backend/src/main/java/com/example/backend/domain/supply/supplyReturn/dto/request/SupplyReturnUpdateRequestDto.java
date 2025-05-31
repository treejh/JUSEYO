package com.example.backend.domain.supply.supplyReturn.dto.request;

import com.example.backend.enums.Outbound;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "반납 요청 변경 요청 DTO")
public class SupplyReturnUpdateRequestDto {
    @Schema(description = "현재 상태", example = "AVAILABLE, DAMAGED", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private Outbound outbound; // 현재상태(사용가능,파손)
}
