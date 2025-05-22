package com.example.backend.domain.item.dto.response;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class ItemLiteResponseDto {
    private String name;
    private String categoryName;
    private Long minimumQuantity;
    private Long totalQuantity;
}
