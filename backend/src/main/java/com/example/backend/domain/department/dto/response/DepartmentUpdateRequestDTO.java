package com.example.backend.domain.department.dto.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentUpdateRequestDTO {

    @NotBlank(message = "부서 이름은 필수입니다.")
    private String name;
}
