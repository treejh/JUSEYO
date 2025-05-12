package com.example.backend.itemInstance.dto.request;

import com.example.backend.enums.Outbound;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateItemInstanceStatusRequestDto {
    @NotNull
    private Outbound status;

    private String finalImage;
}
