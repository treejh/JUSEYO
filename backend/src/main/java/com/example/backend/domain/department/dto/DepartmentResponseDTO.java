package com.example.backend.domain.department.dto;

import com.example.backend.domain.department.entity.Department;
import com.example.backend.enums.ApprovalStatus;
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
        long approvedUserCount = 0L;

        if (department.getUserList() != null) {
            approvedUserCount = department.getUserList().stream()
                    .filter(user -> user.getApprovalStatus() == ApprovalStatus.APPROVED)
                    .count();
        }

        return DepartmentResponseDTO.builder()
                .id(department.getId())
                .name(department.getName())
                .managementDashboardId(department.getManagementDashboard().getId())
                .userCount(approvedUserCount)
                .build();
    }


}