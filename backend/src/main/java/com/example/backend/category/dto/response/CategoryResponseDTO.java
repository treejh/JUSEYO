package com.example.backend.category.dto.response;

import com.example.backend.category.entity.Category;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponseDTO {
    private Long id;
    private String name;
    private Long managementDashboardId;

    public static CategoryResponseDTO fromEntity(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .managementDashboardId(category.getManagementDashboard().getId())
                .build();
    }
}
