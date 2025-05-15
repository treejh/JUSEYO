package com.example.backend.item.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
public class ItemRequestDto {
    private String name;
    private Long minimumQuantity;
    private Long totalQuantity;
    private String serialNumber;
    private Long availableQuantity;
    private String purchaseSource;
    private String location;
    private Boolean isReturnRequired;
    private MultipartFile image;
    private Long categoryId;
    private Long managementId;
}