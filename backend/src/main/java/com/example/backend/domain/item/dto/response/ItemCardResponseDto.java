package com.example.backend.domain.item.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ItemCardResponseDto {
    private Long id;
    private String name;
    private String categoryName;
    private String image;
    private Long availableQuantity;
}