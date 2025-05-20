package com.example.backend.itemInstance.dto.response;

import com.example.backend.enums.Outbound;
import com.example.backend.enums.Status;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemInstanceResponseDto {
    private Long id;
    private Long itemId;
    private String itemName;
    private String instanceCode;
    private Status status;
    private Outbound outbound;
    private String image;
    private String finalImage;
    private String itemImage;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
