package com.example.backend.item.dto.response;

import com.example.backend.enums.Status;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemResponseDto {
    private Long id;
    private String name;
    private String categoryName;
    private String serialNumber;
    private Long minimumQuantity;
    private Long totalQuantity;
    private Long availableQuantity;
    private String purchaseSource;
    private String location;
    private Boolean isReturnRequired;
    private String image;
    private Long categoryId;
    private Long managementId;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private Status status;
}