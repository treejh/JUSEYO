package com.example.backend.domain.itemInstance.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateItemInstanceRequestDto {
    @NotNull
    private Long itemId;

    private String image;
}