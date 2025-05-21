package com.example.backend.domain.managementDashboard.dto;

import com.example.backend.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@Schema(description = "관리자 페이지 응답 DTO")
public class ManagementDashBoardResponseDto {
    @Schema(description = "고유아이디")
    private Long id;

    @Schema(description = "사용자 이름", example = "홍길동")
    private String name;

    @Schema(description = "대표 정보", example = "이순신")
    private String owner;

    @Schema(description = "회사 이름", example = "ABC주식회사")
    private String companyName;

    @Schema(description = "사업자 등록번호 (하이픈 없이 숫자 10자리)", example = "1234567890")
    @Pattern(regexp = "^\\d{10}$", message = "사업자 등록번호는 하이픈 없이 숫자 10자리여야 합니다.")
    private String businessNumber;

    @Schema(description = "상태", example = "활성")
    private Status status;

    @Schema(description = "승인상태",example = "승인")
    private boolean approval;

    @Schema(description = "신청 날짜",example = "2025-05-10T15:30:00")
    private LocalDateTime createdAt;

}
