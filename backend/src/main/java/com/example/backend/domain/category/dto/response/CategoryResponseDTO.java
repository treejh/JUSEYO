package com.example.backend.domain.category.dto.response;

import com.example.backend.domain.category.entity.Category;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryResponseDTO {
    private Long id;
    private String name;
    private Long managementDashboardId;
    private int itemCount;

    public static CategoryResponseDTO fromEntity(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .managementDashboardId(category.getManagementDashboard().getId())
                .itemCount(category.getItemList() != null ? category.getItemList().size() : 0)
                .build();
    }
}
