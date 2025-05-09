package com.example.backend.supplyRequest.dto.response;

import com.example.backend.enums.ApprovalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SupplyRequestResponseDto {
    private Long id;
    private Long itemId;
    private Long userId;
    private Long managementId;
    private String serialNumber;
    private Boolean reRequest;
    private String productName;
    private Long quantity;
    private String purpose;
    private LocalDateTime useDate;
    private LocalDateTime returnDate;
    private boolean rental;
    private ApprovalStatus approvalStatus;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}