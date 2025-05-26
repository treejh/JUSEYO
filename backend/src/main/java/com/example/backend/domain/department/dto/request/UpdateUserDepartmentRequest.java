package com.example.backend.domain.department.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserDepartmentRequest {
    Long userId;
    Long departmentId;
}
