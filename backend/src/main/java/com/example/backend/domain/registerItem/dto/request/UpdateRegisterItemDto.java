package com.example.backend.domain.registerItem.dto.request;

import com.example.backend.enums.Inbound;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "비품 구매 수정 요청 DTO")
public class UpdateRegisterItemDto {
    @Schema(description = "카테고리 ID", example = "5")
    private Long categoryId;

    @Schema(description = "요청 수량", required = true, example = "10")
    private Long quantity;

    @Schema(description = "비품 이름 (신규 구매 시 필수)", example = "무선 마우스")
    private String itemName;

    @Schema(description = "최소 수량", example = "2")
    private Long minimumQuantity;

    @Schema(description = "구매처", example = "쿠팡")
    private String purchaseSource;

    @Schema(description = "비치 위치", example = "3층 회의실")
    private String location;

    @Schema(description = "반납 필수 여부", example = "true")
    private Boolean isReturnRequired;

    @Schema(description = "구매 이미지 ")
    private MultipartFile image;

    @Schema(description = "구매 유형 (첫구매 / 재구매)", example = "FIRST_PURCHASE")
    private Inbound inbound;


}
