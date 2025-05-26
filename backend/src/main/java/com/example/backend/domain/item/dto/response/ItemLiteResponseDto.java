package com.example.backend.domain.item.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ItemLiteResponseDto {
    private String name;
    private String categoryName;
    private Long minimumQuantity;
    private Long totalQuantity;
}
