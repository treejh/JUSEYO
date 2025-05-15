package com.example.backend.supplyReturn.dto.response;

import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.Outbound;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "비품 반납 응답 DTO")
public class SupplyReturnResponseDto {

    @Schema(description = "반납서 ID", example = "12")
    private Long id;

    @Schema(description = "요청서 ID", example = "1001", nullable = true)
    private Long requestId;

    @Schema(description = "회원 ID", example = "501")
    private Long userId;

    @Schema(description = "비품 ID", example = "202")
    private Long itemId;

    @Schema(description = "관리 페이지 ID", example = "1")
    private Long managementId;

    @Schema(description = "고유 번호", example = "SN12345", nullable = true)
    private String serialNumber;

    @Schema(description = "품목명", example = "노트북 충전기")
    private String productName;

    @Schema(description = "반납 수량", example = "1")
    private Long quantity;

    @Schema(description = "사용일자", example = "2025-05-01T10:00:00")
    private LocalDateTime useDate;

    @Schema(description = "반납일자", example = "2025-05-10T15:30:00", nullable = true)
    private LocalDateTime returnDate;

    @Schema(description = "승인 상태 (요청 대기, 승인, 반납 대기, 반납)", example = "승인")
    private ApprovalStatus approvalStatus;

    @Schema(description = "생성일시", example = "2025-05-09T18:32:15")
    private LocalDateTime createdAt;

    @Schema(description = "현재 상태", example = "AVAILABLE, DAMAGED")
    private Outbound outbound; // 현재상태(사용가능,파손)

}
