package com.example.backend.user.dto.response;

import com.example.backend.enums.RoleType;

public interface UserSearchProjection {
    Long     getId();
    String   getName();        // User.name
    String   getDepartmentName();  // User.department.name
    RoleType getRoleName();        // User.role.role (RoleType)
}