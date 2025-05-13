package com.example.backend.supplyReturn.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Schema(description = "비품 반납 요청 DTO")
public class SupplyReturnRequestDto {

    @NotNull
    @Schema(description = "비품 요청서 ID", example = "1001", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long requestId;

    @NotNull
    @Schema(description = "회원 ID", example = "501", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long userId;

    @NotNull
    @Schema(description = "관리 페이지 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long managementId;

    @NotNull
    @Schema(description = "비품 ID", example = "202", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long itemId;

    @Schema(description = "고유 번호", example = "SN12345", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String serialNumber;

    @NotNull
    @Schema(description = "품목명", example = "노트북 충전기", requiredMode = Schema.RequiredMode.REQUIRED)
    private String productName;

    @NotNull
    @Schema(description = "반납 수량", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long quantity;

    @NotNull
    @Schema(description = "사용 일자", example = "2025-05-01T10:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime useDate;

    @Schema(description = "반납 일자", example = "2025-05-10T15:30:00", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private LocalDateTime returnDate;
}

