package com.example.backend.domain.itemInstance.dto.request;

import com.example.backend.enums.Outbound;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemInstanceStatusRequestDto {
    @NotNull
    private Outbound outbound;

    private String finalImage;
}
