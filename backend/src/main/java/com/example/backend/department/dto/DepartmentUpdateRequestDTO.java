package com.example.backend.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentUpdateRequestDTO {

    @Positive(message = "유효한 부서 ID여야 합니다.")
    private Long id;

    @NotBlank(message = "부서 이름은 필수입니다.")
    private String name;
}
