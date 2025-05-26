package com.example.backend.domain.user.dto.response;


import com.example.backend.domain.user.entity.User;
import com.example.backend.enums.ApprovalStatus;
import com.example.backend.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class UserProfileResponseDto {

    Long id;

    String name;

    String email;

    String phoneNumber;

    String managementDashboardName ;

    String departmentName;

    RoleType role;

    ApprovalStatus approvalStatus;




    public UserProfileResponseDto(User user){
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.managementDashboardName = (user.getManagementDashboard() != null)
                ? user.getManagementDashboard().getName()
                : null;
        this.departmentName = (user.getDepartment() != null)
                ? user.getDepartment().getName()
                : null;
        this.role = user.getRole().getRole();
        this.approvalStatus=user.getApprovalStatus();
    }



}
