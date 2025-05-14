package com.example.backend.user.dto.response;

import com.example.backend.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserSearchResponseDto {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private String role;
    private Long managementDashboardId;

    public static UserSearchResponseDto fromEntity(User u) {
        return UserSearchResponseDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .name(u.getName())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole().getRole().name())
                .managementDashboardId(u.getManagementDashboard().getId())
                .build();
    }
}
