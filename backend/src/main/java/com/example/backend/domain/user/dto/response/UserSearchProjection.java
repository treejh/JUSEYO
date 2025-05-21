package com.example.backend.domain.user.dto.response;

import com.example.backend.enums.RoleType;

public interface UserSearchProjection {
    Long     getId();
    String   getName();
    String   getEmail();
    String   getDepartmentName();   // u.department.name
    RoleType getRole();             // r.role → enum 타입인 RoleType
}