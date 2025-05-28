package com.example.backend.domain.item.dto.response;

import com.example.backend.domain.item.entity.Item;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCardResponseDto {
    private Long id;
    private String name;
    private String categoryName;
    private String image;
    private Long availableQuantity;

    public static ItemCardResponseDto fromEntity(Item item) {
        return ItemCardResponseDto.builder()
                .id(item.getId())
                .name(item.getName())
                .categoryName(item.getCategory().getName())
                .image(item.getImage())
                .availableQuantity(item.getAvailableQuantity())
                .build();
    }
}