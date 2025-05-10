package com.example.backend.managementDashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;


@Data
@Schema(description = "관리자 페이지 요청 DTO")
public class ManagementDashBoardRequestDto {

    @NotBlank(message = "이름은 필수입니다.")
    @Schema(description = "사용자 이름", example = "홍길동")
    private String name;

    @NotBlank(message = "대표 정보는 필수입니다.")
    @Schema(description = "대표 정보", example = "이순신")
    private String owner;

    @NotBlank(message = "회사 이름은 필수입니다.")
    @Schema(description = "회사 이름", example = "ABC주식회사")
    private String companyName;

    @NotBlank(message = "사업자 등록번호는 필수입니다.")
    @Schema(description = "사업자 등록번호 (하이픈 없이 숫자 10자리)", example = "1234567890")
    @Pattern(regexp = "^\\d{10}$", message = "사업자 등록번호는 하이픈 없이 숫자 10자리여야 합니다.")
    private String businessNumber;
}
