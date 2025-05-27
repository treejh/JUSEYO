package com.example.backend.domain.department.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentCreateRequestDTO {
    @NotNull
    @Size(max = 10, message = "부서 이름은 최대 10글자까지 가능합니다.")
    private String name;
//    private Long managementDashboardId; // 관리 대시보드 ID
}

