package com.example.backend.chaseItem.dto.request;

import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "비품 추적 요청 DTO")
public class ChaseItemRequestDto {
    @NotNull
    @Schema(description = "SupplyRequest ID", example = "1001")
    private Long requestId;

    @NotNull
    @Schema(description = "품목명", example = "노트북 충전기")
    private String productName;

    @NotNull
    @Schema(description = "수량", example = "1")
    private Long quantity;

    @Schema(description = "이슈(분실, 파손 등)", example = "파손")
    private String issue;
}