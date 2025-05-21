package com.example.backend.domain.chaseItem.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Schema(description = "비품 추적 응답 DTO")
public class ChaseItemResponseDto {
    @Schema(description = "추적ID")
    private Long id;

    @Schema(description = "SupplyRequest ID")
    private Long requestId;

    @Schema(description = "품목명")
    private String productName;

    @Schema(description = "수량")
    private Long quantity;

    @Schema(description = "이슈(분실, 파손 등)")
    private String issue;

    @Schema(description = "생성일시")
    private LocalDateTime createdAt;

    @Schema(description = "수정일시")
    private LocalDateTime modifiedAt;
}