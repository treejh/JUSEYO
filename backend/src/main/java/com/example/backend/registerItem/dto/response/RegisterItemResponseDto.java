package com.example.backend.registerItem.dto.response;


import com.example.backend.enums.Inbound;
import com.example.backend.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import io.swagger.v3.oas.annotations.media.Schema;


@Data
@Builder
@AllArgsConstructor
@Schema(description = "비품 구매 응답 DTO")
public class RegisterItemResponseDto {

    @Schema(description = "비품 ID", example = "101")
    private Long id;

    @Schema(description = "관리 페이지 정보")
    private Long managementDashboardId;

    @Schema(description = "카테고리 정보")
    private Long categoryId;

    @Schema(description = "비품 상세 정보")
    private Long itemId;

    @Schema(description = "비품 이미지 URL", example = "https://example.com/image.jpg")
    private String image;

    @Schema(description = "수량", example = "10")
    private Long quantity;

    @Schema(description = "구매일", example = "2024-05-14T15:30:00")
    private LocalDateTime purchaseDate;

    @Schema(description = "구매처", example = "쿠팡")
    private String purchaseSource;

    @Schema(description = "비치 위치", example = "3층 회의실")
    private String location;

    @Schema(description = "입고 유형 (FIRST_PURCHASE or REPURCHASE)", example = "FIRST_PURCHASE")
    private Inbound inbound;

    @Schema(description = "현재 상태 (ACTIVE or STOP)", example = "ACTIVE")
    private Status status;
}
