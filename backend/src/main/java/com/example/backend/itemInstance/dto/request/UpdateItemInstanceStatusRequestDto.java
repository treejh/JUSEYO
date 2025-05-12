package com.example.backend.itemInstance.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateItemInstanceStatusRequestDto {
    @NotNull
    private InstanceStatus status;
}
