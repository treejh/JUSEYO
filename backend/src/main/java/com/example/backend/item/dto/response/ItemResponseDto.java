package com.example.backend.item.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemResponseDto {
    private Long id;
    private String name;
    private String serialNumber;
    private Long totalQuantity;
    private Long availableQuantity;
    private String purchaseSource;
    private String location;
    private Boolean isReturnRequired;
    private Long categoryId;
    private Long managementId;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}