package com.example.backend.domain.supply.supplyReturn.dto.request;

import com.example.backend.enums.ApprovalStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Schema(description = "반납 상태 변경 요청 DTO")
public class SupplyReturnStatusUpdateRequestDto {

    @NotNull
    @Schema(description = "승인 상태 (예: RETURN_PENDING, RETURNED)", requiredMode = Schema.RequiredMode.REQUIRED)
    private ApprovalStatus approvalStatus;

    @NotNull
    @Schema(description = "입고 이미지", type = "string", format = "binary")
    private MultipartFile image;
}
