package com.example.backend.itemInstance.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemInstanceResponseDto {
    private Long id;
    private Long itemId;
    private String instanceCode;
    private InstanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
