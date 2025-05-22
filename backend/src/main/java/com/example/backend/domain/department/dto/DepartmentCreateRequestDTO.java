package com.example.backend.domain.department.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentCreateRequestDTO {
    private Long id;
    private String name;
//    private Long managementDashboardId; // 관리 대시보드 ID
}

