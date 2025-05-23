package com.example.backend.domain.itemInstance.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateItemInstanceRequestDto {
    @NotNull
    private Long itemId;

    private String image;
}