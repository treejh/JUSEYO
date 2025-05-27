package com.example.backend.domain.category.dto.response;

import com.example.backend.domain.category.entity.Category;
import lombok.*;

import java.util.List;
import java.util.Optional;

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
                .itemCount(Optional.ofNullable(category.getItemList())
                        .map(List::size)
                        .orElse(0))
                .build();
    }
}
