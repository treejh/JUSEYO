package com.example.backend.domain.inventory.inventoryIn.dto.request;

import com.example.backend.enums.Inbound;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryInRequestDto {

    @NotNull
    @Schema(description = "비품 ID", example = "101", required = true)
    private Long itemId;

    @Schema(description = "반납 요청서 ID (nullable)", example = "55", nullable = true)
    private Long returnId;

    @NotNull
    @Schema(description = "입고 수량", example = "10", required = true)
    private Long quantity;

    @NotNull
    @Schema(description = "입고 유형 (PURCHASE, RETURN, REPAIR, REPAIR_RETURN) ", example = "PURCHASE", required = true)
    private Inbound inbound;

    @NotNull
    @Schema(description = "카테고리 ID", example = "7", required = true)
    private Long categoryId;

    @NotNull
    @Schema(description = "관리 페이지 ID", example = "1", required = true)
    private Long managementId;

    @NotNull
    @Schema(description = "비품 입고 이미지 ")
    private MultipartFile image;
}
