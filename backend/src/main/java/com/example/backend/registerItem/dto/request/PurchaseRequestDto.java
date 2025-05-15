package com.example.backend.registerItem.dto.request;

import com.example.backend.enums.Inbound;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "비품 구매 요청 DTO")
public class PurchaseRequestDto {

    @Schema(description = "비품 ID (재구매 시 비품 ID 필수)", example = "1001")
    private Long itemId;

    @NotNull
    @Schema(description = "요청 수량", required = true, example = "10")
    private Long quantity;

    @Schema(description = "비품 이름 (신규 구매 시 필수)", example = "무선 마우스")
    private String itemName;

    @NotNull
    @Schema(description = "최소 수량", example = "2")
    private Long minimumQuantity;

    @NotNull
    @Schema(description = "구매처", example = "쿠팡")
    private String purchaseSource;

    @NotNull
    @Schema(description = "비치 위치", example = "3층 회의실")
    private String location;

    @NotNull
    @Schema(description = "반납 필수 여부", example = "true")
    private Boolean isReturnRequired;

    @NotNull
    @Schema(description = "구매 이미지 ")
    private MultipartFile image;

    @NotNull
    @Schema(description = "카테고리 ID", example = "5")
    private Long categoryId;

    @NotNull
    @Schema(description = "관리 페이지 ID", example = "2")
    private Long managementId;

    @NotNull
    @Schema(description = "구매 유형 (첫구매 / 재구매)", example = "FIRST_PURCHASE")
    private Inbound inbound;

    // 생성자, Getter, Setter (생략)
}

