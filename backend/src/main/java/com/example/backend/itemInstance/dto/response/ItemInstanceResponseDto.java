package com.example.backend.itemInstance.dto.response;

import com.example.backend.enums.Outbound;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemInstanceResponseDto {
    private Long id;
    private Long itemId;
    private String instanceCode;
    private Outbound outbound;
    private String image;
    private String finalImage;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
