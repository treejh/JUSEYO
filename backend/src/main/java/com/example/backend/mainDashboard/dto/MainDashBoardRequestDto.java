package com.example.backend.mainDashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "대시보드 생성 및 수정 요청 DTO")
public class MainDashBoardRequestDto {

    @Schema(description = "대시보드 이름", example = "기본 대시보드")
    private String name;
}
