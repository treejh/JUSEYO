package com.example.backend.mainDashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
@Schema(description = "메인 대시보드 응답 DTO")
public class MainDashBoardResponseDto {

    @Schema(description = "대시보드 ID", example = "1")
    private Long id;

    @Schema(description = "대시보드 이름", example = "관리자 대시보드")
    private String name;

    @Schema(description = "생성일시", example = "2024-05-09T12:34:56")
    private LocalDateTime createdAt;

    @Schema(description = "수정일시", example = "2024-05-10T09:00:00")
    private LocalDateTime updatedAt;
}
