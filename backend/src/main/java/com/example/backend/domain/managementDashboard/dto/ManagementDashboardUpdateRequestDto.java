package com.example.backend.domain.managementDashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "관리자 페이지 수정 요청 DTO")
public class ManagementDashboardUpdateRequestDto {

    @Schema(description = "사용자 이름", example = "홍길동")
    private String name;


    @Schema(description = "대표 정보", example = "이순신")
    private String owner;


    @Schema(description = "회사 이름", example = "ABC주식회사")
    private String companyName;

}
