package com.example.backend.user.dto.response;


import com.example.backend.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class UserProfileResponseDto {

    Long userId;

    String name;

    String email;

    String phoneNumber;

    String managementDashboardName ;

    String departmentName;

    public UserProfileResponseDto(User user){
        this.userId = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.managementDashboardName = (user.getManagementDashboard() != null)
                ? user.getManagementDashboard().getName()
                : null;
        this.departmentName = (user.getManagementDashboard() != null)
                ? user.getDepartment().getName()
                : null;

    }
}
