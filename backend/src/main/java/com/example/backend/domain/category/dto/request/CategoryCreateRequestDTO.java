package com.example.backend.domain.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryCreateRequestDTO {

    @NotBlank(message = "카테고리 이름은 필수입니다.")
    private String name;

    @Positive(message = "유효한 관리 대시보드 ID를 입력해야 합니다.")
    private Long managementDashboardId;
}