package com.example.backend.item.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemRequestDto {
    private String name;
    private String serialNumber;
    private Long totalQuantity;
    private Long availableQuantity;
    private String purchaseSource;
    private String location;
    private Boolean isReturnRequired;
    private Long categoryId;
    private Long managementId;
}