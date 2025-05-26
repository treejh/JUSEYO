package com.example.backend.domain.department.dto;

import com.example.backend.domain.department.entity.Department;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentResponseDTO {
    private Long id;
    private String name;
    private Long managementDashboardId;
    private Long userCount;

    public static DepartmentResponseDTO fromEntity(Department department) {
        return DepartmentResponseDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .managementDashboardId(department.getManagementDashboard().getId())
                .userCount(department.getUserList() != null ? (long) department.getUserList().size() : 0L)
                .build();
    }

}
